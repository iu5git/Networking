const express = require('express'); // импорт библиотеки express
const path = require('path'); // импорт библиотеки path для работы с путями
const app = express(); // создание экземпляра приложения express
const PORT = process.env.PORT || 3000; // присвоения порта
const MAX_RESPONSE_TIMEOUT = 7000; // максимальное время ответа от сервера

// настройка для передачи статических файлов (__dirname - текущая директория)
// метод join используется для соединения путей с учётом особенностей операционной системы
app.use(express.static(path.join(__dirname, 'frontend')));

// по корневому запросу отдаем файл index.html из папки ./frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
})

// описание long polling запроса
app.get('/long-polling-request', (req, res) => {
  const MAX_TIMEOUT = 10000; // максимальное время ожидания ответа
  const MIN_TIMEOUT = 1000; // минимальное время ожидания
  const MAX_VALUE = 1000; // максимальное значение случайного числа
  const MIN_VALUE = 1; // минимальное значение случайного числа

  // выбирается случайное время ожидания из отрезка [1000, 10000]
  const timeout = Math.round((MAX_TIMEOUT - MIN_TIMEOUT) * Math.random() + MIN_TIMEOUT);

  // выбирается случайное число из отрезка [1, 1000]
  const value = Math.round((MAX_VALUE - MIN_VALUE) * Math.random() + MIN_VALUE);

  setTimeout(() => {
    // если случайное время ожидания превысило максимальное для сервера, то отдаем ошибку
    if (timeout > MAX_RESPONSE_TIMEOUT) {
      res.sendStatus(502);
    } else { // иначе отправляем объект
      res.send({value, timeout: (timeout / 1000).toPrecision(2)});
    }
  }, Math.min(7000, MAX_RESPONSE_TIMEOUT))
})

// запуск сервера приложения
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
})
