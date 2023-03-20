# Как поставить Apache kafka на Windows Linux

## Предлагаем вам два способа разворачивания кафки на вашем устройстве с докером и без. Если вы используете Windows, то рекомендуем воспользоваться докером


# Без докера

1. Необходимо скачать apache [kafka](https://kafka.apache.org/downloads) с официального сайта 
2. Рекомендую на диске С создать папку kafka_logs с папками для записи логов

![](assets/image1.jpg)

3. Откроем zookeeper.properties изменим параметр записи логов по созданному выше пути

![](assets/image2.jpg)

4. Аналогично откроем откроем server.properties изменим zookeeper.connection.timeout.ms=60000 и пропишем путь к лог файлу

![](assets/image20.jpg)

5. Скачаем [Java](https://www.java.com/ru/download/) Важно, чтобы в пути, по которому вы скачиваете Java не было пробелов, чтоюы избежать проблемы запуска в дальнейшем
6. В вашем компьютере по пути: 
*Система -> Дополнительные параметры системы -> Дополнительно -> Переменные среды* 
Необходимо добавить в PATH путь к Java, а также переменную JAVA_HOME с путём к JAVA

![](assets/image3.jpg)
![](assets/image4.jpg)

7. Создайте проект и убедитесь, что Java доступна

![](assets/image5.jpg)
![](assets/image6.jpg)

8. Start Zookeeper:
C:/kafka_2.12-3.2.0/bin/windows/zookeeper-server-start.bat C:/kafka_2.12-3.2.0/config/zookeeper.properties

![](assets/Start1.jpg)

9. Start kafka:
Start Kafka-server:
C:/kafka_2.12-3.2.0/bin/windows/kafka-server-start.bat C:/kafka_2.12-3.2.0/config/server.properties

![](assets/Start2.jpg)

10. Не забудьте изменить путь под вашу версию кафки.
Готово!


# С докером
1. Скачайте [докер](https://www.docker.com/products/docker-desktop/) и WSL2 (В Docker desktop будет ссылка)
2. Рекомендую ознакомиться с [документацией](https://learn.microsoft.com/ru-ru/windows/wsl/tutorials/wsl-containers)
3. В корень проекта, в котором вы будете работать поместить конфигурационный [файл](docker-compose.yml) 

![](assets/docker1.jpg)

4. docker-compose.yml делается похоже на ручной запуск из первого пункта. Вот моё готовое решение:
5. В папке проекта напишите *docker compose up -d*
6. В docker должны появиться созданные контейнеры 

![](assets/docker2.jpg)

также можно проверить через *docker ps*

#### Готово. Успешной работы!

# Пример работы с Кафкой

Перед началом работы ознакомьтесь с [документацией](https://kafka-python.readthedocs.io/en/master/)

1. Необходимо создать проект в pyCharm
2. Вам понадобитмя библиотека для работы с кафкой _pip install kafka-python_
3. Из библиотеки рекомендую использовать следующие методы _from kafka import KafkaProducer, KafkaConsumer_
4. Пример функции отправки сообщения в кафку

``` python
def sendKafka():
    my_producer = KafkaProducer(
        bootstrap_servers=['localhost:29092'],
        value_serializer=lambda x: dumps(x).encode('utf-8')
    )

    message = "1"
    while message != "0":
        message = input("Type your message: ")
        my_producer.send("testnum", value=message)
        getKafka()
```

5. Пример функции получения сообщения из кафки

``` python
def getKafka():
    consumer = KafkaConsumer('testnum',
                             bootstrap_servers=['localhost:29092'],
                             group_id='test',
                             auto_offset_reset='earliest')
    for msg in consumer:
        res_str = msg.value.decode("utf-8")
        print("Text:", res_str)
```

//В интернете можно найти более примитивные примеры
