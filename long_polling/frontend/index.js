const list = document.getElementById('list'); // список ответов от сервера
const startButton = document.getElementById('start'); // кнопка запуска long polling запросов
const finishButton = document.getElementById('finish'); // кнопка завершения long polling запросов
let isPolling = false; // текущее состояние запросов

const subscribe = async () => {
  try {
    // отправляем fetch запрос на эндпоинт
    const response = await fetch('/long-polling-request');
    // создаем новый узел li
    const node = document.createElement('li');

    // если статус 200 (все хорошо)
    if (response.status === 200) {
      // Забираем данные из запроса
      const data = await response.json();

      // заполняем узел li содержимым
      node.innerHTML
        = `Данное сообщение с числом <span class="bold">${data.value}</span> было получено через <span class="bold">${data.timeout}с</span> после начала long polling запроса`
    } else if (response.status === 502) { // если время ожидания ответа превышено
      node.innerText = 'Превышено время ожидания ответа от сервера (> 7с)';
    }

    // вставляем в список новый узел
    list.appendChild(node);

    // если соединение еще не прервано, то рекурсивно запускаем функцию subscribe
    if (isPolling) {
      subscribe();
    }
  } catch (e) {
    // если в процессе запроса возникла непредвиденная ошибка на сервере, то запускаем функцию через 1с
    setTimeout(() => {
      // если соединение еще не прервано, то рекурсивно запускаем функцию subscribe
      if (isPolling) {
        subscribe()
      }
    }, 1000)
  }
}

// функция вызывается при нажатии на кнопку "начать"
const startConnectToServer = () => {
  finishButton.disabled = false;
  startButton.disabled = true;
  isPolling = true

  subscribe()
}

// функция вызывается при нажатии на кнопку "закончить"
const finishConnectToServer = () => {
  startButton.disabled = false;
  finishButton.disabled = true;
  isPolling = false;
}