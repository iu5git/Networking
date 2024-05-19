## Методические указания по курсовой работе по дисциплине "Сети и телекоммуникации" для канального уровня
**Задание:**

Необходимо разработать систему обмена текстовыми сообщениями/файлами в реальном времени. Канальный уровень имитирует взаимодействие с удаленным сетевым узлом через канал с помехами. Для этого используется один из четырех вариантов кодирования передаваемых сообщений. Полученный от транспортного уровня json сегмента кодируется в битовый формат соответствующим кодом, вносятся ошибки и затем декодируется для последующей отправки обратно на транспортный уровень.
Сервис должен вносить ошибку с вероятностью P в передаваемую информацию и терять сообщения с вероятностью R. При декодировании либо пакет с ошибкой теряется, либо передается обратно на транспортный после исправления.

![enter image description here](https://github.com/iu5git/Networking/blob/main/assets/Deployment.png?raw=true)

## **Код Хэмминга**

Предположим, что в системе происходит обмен текстом. Передаваемую информацию необходимо защитить кодом Хэмминга - [7,4]. 
Исходные параметры:
- Длина сегмента 200 байт, 
- период сборки сегментов 2 секунд, 
- вероятность ошибки 10%, 
- вероятность потери кадра 2%.

Начнем реализацию с создания библиотеки ham.js для работы кода Хэмминга.
Создадим класс Hamming внутри которого будем описывать все необходимые функции.

**Реализация функций**

Для работы с **контрольными битами** необходимо добавить три основные функции, результатом выполнения которых является строка с данными, дополненная контрольными битами по алгоритму Хэмминга: 
  
1. `_calcRedundantBits(m)`: Рассчитывает количество необходимых контрольных битов (`r`) на основе длины передаваемой строки (`m`).

2. `_posRedundantBits(data, r)`: Вставляет контрольные биты (пока с нулевыми значениями) в исходную строку данных на позиции, которые являются степенями двойки (1, 2, 4, 8, ...). На этих позициях вставляются 0, а остальные биты заполняются данными из исходной строки. Результатом является новая строка данных с контрольными битами на соответствующих позициях.  
  
3. `_calcParityBits(arr, r)`: Рассчитывает значения для контрольных битов на основе данных в строке, включая уже вставленные контрольные биты с нулевыми значениями. Каждый контрольный бит рассчитывается таким образом, чтобы сумма значений битов в определенных позициях, которые он контролирует, была четной (или нечетной, в зависимости от используемой схемы четности). Это достигается путем использования операции XOR для определенных позиций битов.  
 
Пример реализации:
		
```javascript
	_calcRedundantBits(m) {
	    for (let i = 0; i < m; i++) {
	    	if (Math.pow(2, i) >= m + i + 1) {
    		    return i;
    		    }
    		 }
    	}
    _posRedundantBits(data, r) {
        //Биты избыточности размещаются в позициях степени 2
        let j = 0;
        let k = 1;
        let m = data.length;
        let res = '';

        //Если позиция равна степени 2, то вставляется 0
        // иначе добавляются биты данных
        for (let i = 1; i < m + r + 1; i++) {
            if (i === Math.pow(2, j)) {
                res = res + '0';
                j += 1;
            } else {
                res = res + data[data.length - k];
                k += 1;
            }
        }
        // Выводим результат в обратном порядке( т.к. записывали в прямом)
        return res.split('').reverse().join('');
    }
    _calcParityBits(arr, r) {
        let n = arr.length;

        for (let i = 0; i < r; i++) {
            let val = 0;
            for (let j = 1; j < n + 1; j++) {
                if ((j & Math.pow(2, i)) === Math.pow(2, i)) {
                    val = val ^ parseInt(arr[arr.length - j]);
                }
            }
            arr = arr.slice(0, n - Math.pow(2, i)) + val + arr.slice(n - Math.pow(2, i) + 1);
        }

        return arr.split("").reverse().join("");
    }
```

Создадим статический метод `coding`, предназначенный для **кодирования данных** с использованием кода Хэмминга. 
```JavaScript
        /**
         * Закодировать данные кодом хэмминга
         * @param data Строка с данными
         * @returns {*} Закодированная строка
         */
        static coding(data){
            let r = this.prototype._calcRedundantBits(data.length)
            return this.prototype._calcParityBits(this.prototype._posRedundantBits(data, r), r)
        }
```
Теперь давайте проверим метод `coding` на данных:
```JavaScript
const data = "1011";
const encodedData = Hamming.coding(data);
console.log(Закодированные данные: ${encodedData});
```

Когда вы выполните этот код, он должен закодировать строку "1011" с использованием кода Хэмминга и вывести результат. 

![Пример вывода в консоли](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-05-14%20%D0%B2%2022.40.49.png?raw=true)

Если предыдущие шаги привели к истинному результату и все методы работы с контрольными битами отработали корректно, то можно переходить к работе с функциями обнаружения ошибки. Код для проверки `coding` можно удалить.

НаНа данном этапе напишем реализацию функций для работы **с ошибками**:

1. `_detectError(arr)`: Эта функция обнаруживает наличие ошибки в переданной последовательности. Она вычисляет номер бита, в котором произошла ошибка, используя контрольные биты, вставленные в последовательность согласно алгоритму Хэмминга. Для каждого контрольного бита функция проверяет, соответствует ли сумма контролируемых им битов ожидаемому значению (четность/нечетность). Результатом является номер ошибочного бита, считая справа.  
  
2. `_fixError(data)`: После обнаружения ошибки в последовательности эта функция исправляет её, инвертируя значение ошибочного бита. Если функция `_detectError` возвращает 0, это означает, что ошибка не обнаружена, и данные остаются без изменений. В противном случае, ошибочный бит инвертируется для исправления ошибки.  
  
3. `_decodingHam(data)`: Финальная функция декодирует данные, первоначально исправляя в них возможные ошибки с помощью `_fixError`, а затем удаляя контрольные биты, чтобы восстановить исходную последовательность данных. После удаления контрольных битов, полученная последовательность инвертируется для восстановления исходного порядка битов.

    ```JavaScript
        _detectError(arr) {
    
            // Определяем кол-во контрольных битов в последовательности
            let nr = 0
            for (let i = 1; i < arr.length; i++)
                if (Math.pow(2, i) >= arr.length)
                {
                    nr = i
                    break
                }
    
            let n = arr.length;
            let res = 0;
    
            for (let i = 0; i < nr; i++) {
                let val = 0;
                for (let j = 1; j < n + 1; j++) {
                    if ((j & Math.pow(2, i)) === Math.pow(2, i)) {
                        val = val ^ parseInt(arr[arr.length - j]);
                    }
                }
                res = res + val * Math.pow(10, i);
            }
    
            return arr.length - parseInt(res.toString(), 2) + 1;
        }
    
        _fixError(data){
            let nError = this._detectError(data)
            if (nError === 0)
                return data
    
            if (data[nError - 1] === '1')
                return  this._replaceAt(data, nError-1, "0")
            else
                return  this._replaceAt(data, nError-1, "1")
    
        }
    
        _decodingHam(data){
            data = this._fixError(data) // исправляем ошибку если она есть
            let nr = 0 
            for (let i = 1; i < data.length; i++)
                if (Math.pow(2, i) >= data.length)
                {
                    nr = i
                    break
                }
    
            for (let i = nr - 1; i >= 0; i--){
                let posControlBit = Math.pow(2, i)
                data = data.slice(0, posControlBit - 1) + data.slice(posControlBit); // Вырезаем контрольные биты
            }
    
            return data.split("").reverse().join("");
        }
    ```


Создадим метод `checkError`, который предназначен для **обнаружения ошибочного бита** в данных, используя метод `_detectError`. Метод возвращает  номер ошибочного бита в данных или если ошибок не обнаружено - 0.
```JavaScript
     /**
         * Указывает номер плохого бита, если его нет, то возвращает 0
         * @param data Данные для поиска ошибки
         * @returns {number} Номер бита ошибки, если его нет, то 0
         */
        static checkError(data){
            return this.prototype._detectError(data)
        }
```
Теперь давайте создадим тестовый сценарий для проверки метода `checkError`:

```JavaScript
const originalData = "1011";
const encodedData = Hamming.coding(originalData);

console.log("Original Data:", originalData);
console.log("Encoded Data:", encodedData);

// Вносим ошибку в закодированные данные (например, изменим первый бит)
let erroneousData = Hamming.prototype._replaceAt(encodedData, 0, encodedData[0] === '0' ? '1' : '0');

console.log("Erroneous Data:", erroneousData);

// Проверяем наличие ошибки и ее позицию
let errorBitPosition = Hamming.checkError(erroneousData);
console.log("Error Bit Position:", errorBitPosition);

```

Если вывод соответствует ожидаемому, значит ваш метод `checkError` и весь класс `Hamming` работают корректно.

![Пример вывода в консоли](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-05-14%20%D0%B2%2023.01.31.png?raw=true)

Важно, что **если в сегменте обнаружена ошибка**, то необходимо вызывать метод `_replaceAt,` предназначенный для замены символа в строке по указанному индексу на другой символ или строку. Если индекс выходит за пределы строки, метод возвращает исходную строку без изменений. В случае успешной замены, метод возвращает новую строку, где символ на заданном индексе заменен на указанную подстроку `replacement`, при этом остальная часть строки остается неизменной.
```JavaScript
    _replaceAt(str,index,replacement) {
            if(index > str.length-1) return str;
            return str.substring(0,index) + replacement + str.substring(index+1);
        }
```
Добавим методы, которые работают с **закодированными данными** `fixedError` и `decoding`.

```JavaScript
 
        static fixedError(data){
            return this.prototype._fixError(data)
        }
```
  `decoding` метод пишется аналогично с использованием `_decodingHam`.

Чтобы убедиться в том, что наш класс `Hamming` работает корректно, к прошлому коду для провери `checkError` добавим:
```JavaScript
// Проверяем наличие ошибки и ее позицию
let errorBitPosition = Hamming.checkError(erroneousData);
console.log("Error Bit Position:", errorBitPosition);

// Исправляем ошибку и декодируем данные обратно
let fixedData = Hamming.fixedError(erroneousData);
console.log("Fixed Data:", fixedData);

let decodedData = Hamming.decoding(fixedData);
console.log("Decoded Data:", decodedData);
```
В результате для тестовых данных "1011" должны получить:

![Пример вывода в консоли](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-05-14%20%D0%B2%2023.08.45.png?raw=true)

## Реализация Backend

Библиотека для кода Хэмминга готова. Теперь необходимо создать новый проект на js и переместить библиотеку ham.js внутрь него. Также создадим отдельный файл app.js для backend части канального уровня.

С помощью кода пропишем создание сервера на базе Express, который обрабатывает POST-запросы. Он предназначен для демонстрации работы с кодированием и декодированием данных с использованием кода Хэмминга, а также для имитации ошибок в закодированных данных. 

```JavaScript
    const {Hamming} = require("./ham");  
      
    const SEGMENT_SIZE = 200  
    const CHANCE_OF_ERROR = 0.1  
      
    const app = express();  
    const sep = (xs, s) => xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : []  
      
    app.use(bodyParser.json());  
    app.use(bodyParser.urlencoded({ extended: true }));
        app.post('/', async (req, res) => {  
        try {  
        // let json = circularJSON.stringify(req.body);  
        const queueCoding = makeData(req.body) // закодированные данные  
        console.log(queueCoding)  
      
    const queueMistake = makeMistake(queueCoding) // битые данные  
    console.log(queueMistake)  
      
    const queueDecrypted = decodingData(queueMistake) // декодированные данные  
    res.send(returnMyJSON(queueDecrypted));  
    }  
    catch(e) {  
    console.log(e);  
    res.send({ error: e.message });  
    }  
    });
```

В данном коде SEGMENT_SIZE и CHANCE_OF_ERROR задают параметры для работы с кодом Хэмминга и будет задаваться в **зависимости от варианта задания.**

 **Обработка POST-запроса**:
 
   Внутри обработчика POST-запроса происходит:

        - Получение данных из тела запроса.
        - Кодирование данных с помощью функции makeData.
        - Внесение ошибок в закодированные данные с помощью функции makeMistake. 
        - Декодирование данных с исправлением ошибок с помощью функции decodingData. 
        - Отправка декодированных данных клиенту с помощью функции returnMyJSON.
        - В случае возникновения исключения в процессе обработки запроса, сервер логирует ошибку и отправляет ответ с описанием ошибки клиенту.

**Функции makeData, makeMistake, decodingData:**

Данные функции вместе создают полный цикл обработки данных для передачи с использованием кодирования Хэмминга, который включает в себя кодирование исходных данных, имитацию ошибок в закодированных данных, декодирование данных с исправлением возможных ошибок, и возвращение данных в исходном формате. 

**makeData(data)**

Эта функция предназначена для подготовки данных к передаче. Она принимает исходные данные (data), кодирует их в бинарный формат с использованием кодирования Хэмминга, и разбивает на сегменты по 200 байт (или другое значение, заданное константой SEGMENT_SIZE).

```JavaScript
    function makeData(data){  
    const a = new TextEncoder().encode(JSON.stringify(data)) // переводим объект в байтовый массив  
    let n = 0; // номер сегмента  
    let cod = [''] // список сегментов по 200 байт  
    // пройдем по всем байтам  
    a.map((el, ind)=>{  
    //cod[n] += MyHam.Hamming.coding("00000000".substr(el.toString(2).length) + el.toString(2)); // кодируем байт, переведенный в 2 код(с незначащими нулями)  
      
    let a_bit = sep("00000000".substr(el.toString(2).length) + el.toString(2), 4)  
      
    a_bit.map((el, ind)=>{  
    a_bit[ind] = MyHam.Hamming.coding(el)  
    })  
    cod[n] += a_bit.join('')  
      
    if ((ind+1) % SEGMENT_SIZE === 0){ // разбиваем по 200 байт  
    n++  
    cod[n] = ''  
    }  
      
    })  
      
    return sep(cod.join(''),7)  
    }
```

**makeMistake(trueData)**

Функция имитирует ошибки в закодированных данных. Она принимает на вход список закодированных сегментов (trueData) и для каждого сегмента с определенной вероятностью (задается константой CHANCE_OF_ERROR) вносит изменение в один случайно выбранный бит.
```JavaScript
    function makeMistake(trueData){  
    const badData = []  
    trueData.map((el, index)=>{  
    if (Math.random() < CHANCE_OF_ERROR) // шанс 10%, что ошибка  
    {  
    const rand_ind = Math.floor(Math.random() * el.length);  
    if (el[rand_ind] === '1')  
    badData[index] = el.substring(0,rand_ind) + '0' + el.substring(rand_ind+1);  
    else  
    badData[index] = el.substring(0,rand_ind) + '1' + el.substring(rand_ind+1);  
    }  
    else  
    badData[index] = el  
    })  
    return badData  
    }
```

**decodingData(badData)**

Эта функция занимается декодированием данных, исправляя возможные ошибки. Она принимает на вход список сегментов данных (badData), которые могут содержать ошибки, и для каждого сегмента выполняет декодирование с исправлением ошибок с помощью алгоритма Хэмминга.
```JavaScript
    function decodingData(badData){  
    const trueData = []  
      
    badData.map((el, ind) =>{  
    trueData[ind] = Hamming.decoding(el) // декодировка и исправление ошибки если она есть  
    })  
    return trueData  
    }

**returnMyJSON(decryptedData)**
```

После декодирования и исправления ошибок в данных, эта функция преобразует декодированные бинарные данные обратно в исходный формат. Она принимает на вход список байтов (decryptedData), преобразует их из бинарного формата обратно в текстовую строку JSON, а затем парсит эту строку в объект JavaScript.
```JavaScript

    function returnMyJSON(decryptedData){  
    const binByte = sep(decryptedData.join(''), 8) // список байтов в 2 коде  
    const bytesList = []  
    let textDecoder = new TextDecoder();  
    binByte.map((el, ind)=>{  
    bytesList.push(parseInt(el, 2));  
    })  
    return textDecoder.decode(new Uint8Array(bytesList))  
    }
```
  
Для корректной работы всей программы необходимо также указать номер порта для прослушивания, например:
```JavaScript

    app.listen(3050, () => {  
    console.log(`Server initialized. Try it on http://localhost:${3050}`);  
    })
   Порт прослушивания может быть `3050`
```

## Запуск и тестирование кода Хэмминга
Запустим app.js и проверим `post` запрос с помощью insomnia.
![Post-request](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-03-28%20%D0%B2%2023.48.08%20(1).png?raw=true
)

Проверяем `Response` с помощью insomnia.
![Post-response](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-03-28%20%D0%B2%2023.48.08%20(2).png?raw=true)

**Вывод:** 
Если исходные данные после применения кода Хэмминга остались прежними, из этого можно сделать несколько выводов:

1. **Корректная работа алгоритма без обнаружения ошибок:** Это может означать, что код Хэмминга был корректно применен для кодирования и декодирования данных, и в процессе передачи данные не были искажены, или искажения были успешно исправлены. Таким образом, исходные данные были восстановлены без изменений.

2. **Отсутствие ошибок в данных:** Если в данных не было ошибок и функция makeMistake не вносила искажений (или вероятность внесения ошибки была настолько низка, что ошибки не произошло), то после декодирования данные останутся прежними, так как код Хэмминга не обнаружит необходимости в исправлении

В качестве эксперимента предлагается увеличить вероятность внесения ошибки и проверить выходной результат.

 
