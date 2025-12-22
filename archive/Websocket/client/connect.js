// подключение к сокету
let websocket = new WebSocket('ws://localhost:5001/websockets')

//обработчик собития подключения к сокету
websocket.onopen = () => {
    console.log('success')
}

websocket.onclose = (message) => {
    console.log('connection closed')
    console.log(message)
    const message_text = JSON.parse(message.reason)
        // создаем блок для отображения сообщения от сервера
    let div = document.createElement('div')
    div.style.width = '450px'
    div.style.textAlign = 'right'
    div.style.marginTop = '5px'
        //добавляем в блок сообщение
    div.innerHTML = message_text.message
        //прикрепляем блок с нашему блоку с сообщениями
    messages.append(div)

}

const messages = document.getElementById('messages')

// обработчик входящий сообщений
websocket.onmessage = (message) => {
    // распарсили джейсон, потому что ответ от сервера приходит в джейсоне
    const message_text = JSON.parse(message.data)
        // создаем блок для отображения сообщения от сервера
    let div = document.createElement('div')
    div.style.width = '450px'
    div.style.textAlign = 'right'
    div.style.marginTop = '5px'
        //добавляем в блок сообщение
    div.innerHTML = message_text.message
        //прикрепляем блок с нашему блоку с сообщениями
    messages.append(div)
}

const button = document.getElementById('button')
const input = document.getElementById('input')
const button_close = document.getElementById('button_close')

button.addEventListener('click', (ev) => {
    ev.preventDefault()

    // допустим мы не хотим отправлять пустое сообщение(таким же образом можно наставить какие-нибудь валидаторы)
    if (input.value == '') {
        alert('нельзя отправить пустое сообщение')
    } else {
        // отправляем сообщение серверу
        websocket.send(JSON.stringify({ message: input.value }))
            // снова создаем блок, только чтобы отобразить исходящее сообщение
        let div = document.createElement('div')
        div.style.width = '500px'
        div.style.textAlign = 'left'
        div.style.marginTop = '5px'
        div.innerHTML = input.value
        messages.append(div)
            // обнуляем значение инпута для дальшейшего ввода
        input.value = ''
    }
})

button_close.addEventListener('click', (ev) => {
    ev.preventDefault()
        // закрываем сооединение на стороне клиента
    websocket.close(1000, JSON.stringify({ message: 'connection closed by client' }))
})