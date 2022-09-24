const express = require('express')
const websocket = require('./websocket/index.js')

// создаем приложение экпресс
const app = express()
const port = process.env.PORT || 5001

// запускаем сервер на порту
const server = app.listen(port, () => {
    console.log(`server has been started on ${port} port`)
})

// интегрируем вебсокеты внуть сервера 
websocket(server)