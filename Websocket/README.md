
# Пример взаимодействия через WebSocket 

Для примера взаимодействия клиента и сервера, напишем приложение, которое будет возвращать нам наши сообщения и добавлять в конец смайлик
Этакий мессенджер, но только с сервером, а не человеком

Как запускать
============

Выполняем следующие манипуляции:
* заходим сначала в папку client

        cd client

* далее устанавливаем зависимости 

        npm i или npm install

* после то же самое, но в папке server
* затем запускаем сервер сначала в папке server, потом в client 

        npm run start

## Суть взаимодействия

Протокол WebSocket чаще всего используется для обмена данных в реальном времени,
то есть мы имеем подключение с сервером, по которому происходит обмен информацией, 
при этом это подключение не закрывается до определенного времени или действия юзера.

## теперь по пунктам:
* нам потребуется на стороне сервера создать сокет и ждать подключения со стороны клиента
* затем обработать собитие приходящих сообщений и отправить на клиент обновленное сообщение 
* на стороне клиента сделать инпут поле и кнопку для отправки сообщений на сервер
* далее подключиться к сокету
* и написать обработчик входящий сообщений 

## используемые средства разработки 
### серверная часть:
* express - библеотека для имитации сервера
* query-string - библиотека для работы со строками(парсить параметры запроса)
* ws - библеотека для работы с веб сокетами 
### фронтальная часть:
* express - чтобы разграничить бэк и фронт(потом все равно придется учить React, а он всегда разворачивается на отдельном сервере)
* JavaScript предоставляет встроеные API для работы с вебсокетами так, что даже ставить ничего не нужно 

весь код раскомментирован, снизу оставлю полезные ссылки, с описанием API сокетов для сервера и клиента также пару пунктов на потом для курсовой работы

## Полезные ссылки:

* [https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketserveroptions-callback] - вообще все по библетеке ws
* [https://learn.javascript.ru/websocket] - описание протокола, апи и даже примеры работы с сокетами для клиента

### [На потом]: стек React+TypeScript
так как апи для работы с вебсокетами пояивлось намного раньше, чем TypeScript, и было обновлено уже после его выхода,(я не знаю почему никто это не фиксит) возникает пара проблем: 
* для написания интерфейса к мессенджеру использовал связку useRef, useState, useEffect. Первый чтоб хранить сокет, но проблема в том что в useRef обязательно надо класть начальное состояние
и если это не null(по дефолту), то websocket(потому что это тип), но такая штука, как ререндер при каждом обновлении страницы пыталась бы создать новое подключение к сокету, когда оно уже существует. Решении в generic типах:

        const ws = useRef<WebSocket | null>(null)

(-2 дня на stackoverflow)
* не используйте socket.io-client(тоже библиотека для работы с сокетами, более популярная чем ws), если у вас бэк не использует socket.io(то есть он написан на node.js), в противном случае будет трудно наладить коннект между клиентом и сервером(линк для подключения строится из какого ненужного мусора и наровит самостоятельно дописывать пути)