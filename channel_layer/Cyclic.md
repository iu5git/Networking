## Методические указания по курсовой работе по дисциплине "Сети и телекоммуникации" для канального уровня
**Задание:**

Необходимо разработать систему обмена текстовыми сообщениями/файлами в реальном времени. Канальный уровень имитирует взаимодействие с удаленным сетевым узлом через канал с помехами. Для этого используется один из четырех вариантов кодирования передаваемых сообщений. Полученный от транспортного уровня json сегмента кодируется в битовый формат соответствующим кодом, вносятся ошибки и затем декодируется для последующей отправки обратно на транспортный уровень.
Сервис должен вносить ошибку с вероятностью P в передаваемую информацию и терять сообщения с вероятностью R. При декодировании либо пакет с ошибкой теряется, либо передается обратно на транспортный после исправления.

![enter image description here](https://github.com/iu5git/Networking/blob/main/assets/Deployment.png?raw=true)

## **Циклический код**

Предположим, что в системе происходит обмен текстом. Передаваемую информацию необходимо защитить Цикличским кодом - [7,4]. 
Исходные параметры:
- Длина сегмента 100 байт, 
- период сборки сегментов 2 секунд, 
- вероятность ошибки 10%, 
- вероятность потери кадра 2%.

Начнем реализацию с создания библиотеки cycle.js для работы
Циклического кода.
Создадим класс `Cycle` внутри которого будем описывать все необходимые функции.

### Класс `Cycle`

Класс `Cycle` реализует циклический код для кодирования и декодирования битовых строк\. Циклические коды являются подклассом линейных блоковых кодов и обладают важным свойством: циклический сдвиг кодового слова также является кодовым словом\. В данном случае используется порождающий полином "1011"\.

#### Статический метод `coding(bitStr)`

Этот метод выполняет кодирование битовой строки\.

```javascript
static coding(bitStr) {
    bitStr += "000";
    return (parseInt(bitStr, 2) + parseInt(this.prototype.del(bitStr), 2)).toString(2);
}
```

1\. Добавление нулей:
   ```javascript
   bitStr += "000";
   ```
   Этот участок кода добавляет три нуля в конец исходной битовой строки\. Эти нули нужны для того, чтобы оставить место для контрольных битов, которые будут добавлены в процессе кодирования\.

2\. Выполнение деления XOR:
   ```javascript
   return (parseInt(bitStr, 2) + parseInt(this.prototype.del(bitStr), 2)).toString(2);
   ```
   \- `parseInt(bitStr, 2)` преобразует битовую строку в целое число\.
   
   \- `this.prototype.del(bitStr)` вызывает метод `del`, который выполняет деление по модулю 2 и возвращает остаток\.
   
   \- `parseInt(this.prototype.del(bitStr), 2)` преобразует остаток в целое число\.
   
   \- Сложение двух чисел и преобразование результата обратно в битовую строку с помощью `toString(2)` дает нам закодированную строку\.

#### Статический метод `decoding(bitStr)`

Этот метод выполняет декодирование битовой строки, исправляя возможные ошибки\.

```javascript
    static decoding(bitStr) {
        if (this.prototype.del(bitStr) === "000") {
            return bitStr.slice(0, -3);
        }

        let d = parseInt(this.prototype.del(bitStr), 2); // Остаток от деления
        let iter = 0;

        while (d > 1 && iter <= 7) {
            iter++;
            bitStr = bitStr.slice(-1) + bitStr.slice(0, -1); // Циклический сдвиг на один бит влево
            d = parseInt(this.prototype.del(bitStr), 2);
        }

        let res = (parseInt(bitStr, 2) ^ d).toString(2);

        for (let i = 0; i < iter; i++) {
            res = res.slice(1) + res.charAt(0); // Циклический сдвиг на один бит вправо
        }

        return res.slice(0, -3);
```
Этот метод `decoding` принимает строку `bitStr`, проверяет, равен ли результат деления остатку "000"\. Если да, то возвращает часть строки до последних трех символов\. В противном случае, он выполняет циклический сдвиг влево и находит результат XOR между строкой и остатком\. Затем выполняется циклический сдвиг вправо и возвращается результат без последних трех символов\.

#### Прототипный метод `del(bitStr)`

Этот метод выполняет деление битовой строки по модулю 2 с использованием порождающего полинома "1011"\.

```javascript
del(bitStr) {
    let pol = "1011"; // порождающий полином
    let res = bitStr.slice(0, 4);
    let i = 4;

    while (i < 10) {
        res = (parseInt(res, 2) ^ parseInt(pol, 2)).toString(2);
        while (res.length < 4) {
            if (i === 7) {
                return res;
            }
            res += bitStr[i];
            i++;
        }
    }
    return "bad_data";
}
```

 
### Тестирование функций

Для тестирования каждой функции отдельно на данных, давайте подготовим несколько примеров входных данных и протестируем каждую функцию отдельно.

#### Тестирование метода coding
```javascript
const input1 = "1101";
const encoded1 = Cycle.coding(input1);
console.log(Encoded 1: ${encoded1});

const input2 = "101010";
const encoded2 = Cycle.coding(input2);
console.log(Encoded 2: ${encoded2});
```
Ожидаемые результаты:

![Test_coding](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A6%D0%B8%D0%BA%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B8%CC%86_%D0%BA%D0%BE%D0%B4_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-05-15%20%D0%B2%2001.02.15.png?raw=true)

#### Тестирование метода decoding
```javascript
const input1 = "1101";
const encoded1 = Cycle.coding(input1);
console.log("Encoded 1:", encoded1);

const input2 = "101010";
const encoded2 = Cycle.coding(input2);
console.log("Encoded 2:", encoded2);

const decoded1 = Cycle.decoding(encoded1);
console.log("Decoded 1:", decoded1);

const decoded2 = Cycle.decoding(encoded2);
console.log("Decoded 2:", decoded2);
```
Ожидаемые результаты:
![Test_decoding](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A6%D0%B8%D0%BA%D0%BB%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B8%D0%B8%CC%86_%D0%BA%D0%BE%D0%B4_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-05-15%20%D0%B2%2001.19.59.png?raw=true)

## Реализация Backend

Библиотека для Циклического кода готова. Теперь необходимо создать новый проект на js и переместить библиотеку cycle.js внутрь него. Также создадим отдельный файл app.js для backend части канального уровня.

С помощью кода пропишем создание сервера на базе Express, который обрабатывает POST-запросы. Он предназначен для демонстрации работы с кодированием и декодированием данных с использованием кода Хэмминга, а также для имитации ошибок в закодированных данных. 

```JavaScript
const http = require("http");
const express = require('express');
const bodyParser = require('body-parser');
const circularJSON = require('circular-json');
const {Cycle} = require("./cycle");

const SEGMENT_SIZE = 100
const CHANCE_OF_ERROR = 0.1

const app = express();
const sep = (xs, s) => xs.length ? [xs.slice(0, s), ...sep(xs.slice(s), s)] : []

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/cycle', async (req, res) => {
    try {

        const queueCoding = makeData(req.body, false) // закодированные данные
        console.log(queueCoding)

        const queueMistake = makeMistake(queueCoding) // битые данные
        console.log(queueMistake)

        const queueDecrypted = decodingData(queueMistake, false) // декодированные данные
        res.send(returnMyJSON(queueDecrypted));
    }
    catch(e) {
        console.log(e);
        res.send({ error: e.message });
    }
});

app.listen(3050, () => {
    console.log(`Server initialized. Try it on http://localhost:${3050}`);
})

/**
 * Подготовка данных для передачи (создание сегментов по 100 байт в бинарном коде
 * @param data Данные
 */
function makeData(data, cycle){
    const a = new TextEncoder().encode(JSON.stringify(data)) // переводим объект в байтовый массив

    let n = 0; // номер сегмента
    let cod = [''] // список сегментов по 200 байт
    // пройдем по всем байтам
    a.map((el, ind)=>{

        let a_bit = sep("00000000".substr(el.toString(2).length) + el.toString(2), 4)

        a_bit.map((el, ind)=>{
            if (cycle)
                a_bit[ind] = MyHam.Hamming.coding(el)
            else
                a_bit[ind] = Cycle.coding(el)
        })
        cod[n] += a_bit.join('')

        if ((ind+1) % SEGMENT_SIZE === 0){ // разбиваем по 100 байт
            n++
            cod[n] = ''
        }

    })

    return sep(cod.join(''),7)
}

/**
 * Создает ошибку в каждом сегменте с вероятностью
 * @param trueData
 * @returns {*[]}
 */
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

function decodingData(badData, cycle){
    const trueData = []

    badData.map((el, ind) =>{
        if (ham)
            trueData[ind] = Hamming.decoding(el) // декодировка и исправление ошибки если она есть
        else
            trueData[ind] = Cycle.decoding(el) // декодировка и исправление ошибки если она есть
    })
    return trueData
}

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

В данном коде SEGMENT_SIZE и CHANCE_OF_ERROR задают параметры для работы и будет задаваться в **зависимости от варианта задания.**

 **Обработка POST-запроса**:
 
   Внутри обработчика POST-запроса происходит:

        - Получение данных из тела запроса.
        - Кодирование данных с помощью функции makeData.
        - Внесение ошибок в закодированные данные с помощью функции makeMistake. 
        - Декодирование данных с исправлением ошибок с помощью функции decodingData. 
        - Отправка декодированных данных клиенту с помощью функции returnMyJSON.
        - В случае возникновения исключения в процессе обработки запроса, сервер логирует ошибку и отправляет ответ с описанием ошибки клиенту.


Для корректной работы всей программы необходимо также указать номер порта для прослушивания, например:
```JavaScript
    app.listen(3050, () => {  
    console.log(`Server initialized. Try it on http://localhost:${3050}`);  
    })
   Порт прослушивания может быть `3050`
```

## Запуск и тестирование Циклического кода
Запустим app.js и проверим `post` запрос с помощью insomnia.
![Post-request](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-03-28%20%D0%B2%2023.48.08%20(1).png?raw=true
)

Проверяем `Response` с помощью insomnia.
![Post-response](https://github.com/AlinaVorontsova/Seti/blob/main/%D0%A5%D1%8D%D0%BC%D0%BC%D0%B8%D0%BD%D0%B3_%D1%84%D0%BE%D1%82%D0%BE/%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA%20%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0%202024-03-28%20%D0%B2%2023.48.08%20(2).png?raw=true)

**Вывод:** 
Если исходные данные после применения кода циклического [7,4] остались прежними, то из этого можно сделать несколько выводов:

1. Ошибка была обнаружена и исправлена: Кодирование циклическим кодом [7,4] позволяет обнаружить ошибки в данных и восстановить их. Если данные остались прежними, это может указывать на успешное обнаружение и исправление ошибок.

2. Отсутствие ошибок в переданных данных: Если данные остались неизменными после применения кода, это может означать, что передаваемые данные были достаточно надежными и не содержали ошибок.

 
