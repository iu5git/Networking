# Пример использования MinIO S3 на Python
Здесь описаны базовые методы взаимодействия с Minio на python, а также небольшой 
реальный пример использования этих функций.  
Предполагается, что кластер Minio уже запущен по адресу localhost:9000.  

## Установка соединения
Во-первых, установим Python библиотеку для взаимодействия с MinIO:  
```
pip3 install minio
```  
Воспользуемся методом из данной библиотеки для создания объекта подключения
к нашему кластеру Minio:  
```Py
from minio import Minio

client = Minio(endpoint="localhost:9000",   # адрес сервера
               access_key='minio',          # логин админа
               secret_key='minio124',       # пароль админа
               secure=False)                # опциональный параметр, отвечающий за вкл/выкл защищенное TLS соединение
```
Все методы взаимодействия с хранилищем будут вызываться при обращении к этому объекту.  
Далее приведены основные методы, необходимые для работы с хранилищем.

## Написание функций для обращения к хранилищу
Сразу стоит отметить, что в minio **отсутствует метод для создания новых пользователей**.
Как вариант, вместо как таковых пользователей можно использовать отдельные бакеты, 
а подключение осуществлять только через админа.

### Управление бакетами
Для создания бакета используется функция `make_buсket`:
```Py
def add_new_bucket(name:str):
    client = Minio(endpoint='localhost:9000',
                     access_key='minio',
                     secret_key='minio124')
    client.make_bucket(bucket_name=name)    # создание бакета
```
Другие функции для манипуляции бакетами:
```Py
list = client.list_buckets()           # возвращает список всех бакетов

client.bucket_exists(bucket_name)      # проверяет существование бакета с данным названием
                                       # возвращает true или false    

client.remove_bucket(bucket_name)      # удаление бакета
```

### Управление объектами
Для загрузки / выгрузки объектов существует 2 подхода: через файлы и через поток байтов. 
Принципиального различия в этих методах нет, можно выбирать наиболее удобный и эффективный 
в рамках конкретной задачи. Функции чтения / записи:
```Py
# запись объекта в хранилище из файла
client.fput_object(bucket_name='your_bucket_name',  # необходимо указать имя бакета,
                   object_name='new_object_name',   # имя для нового файла в хринилище
                   file_path='/files/your_file')    # и путь к исходному файлу


# выгрузка объекта из хранилища в ваш файл              
client.fget_object(bucket_name='your_bucket_name',      # необходимо указать имя бакета,  
                   object_name='your_object_name',      # имя файла в хранилище
                   file_path='/files/temp_file')        # и путь к файлу для записи
                   
                   
# пример записи строковых данных в хранилище через поток
import io
str_io_object = io.StringIO('some data in string format') # перевод из строки в поток
data_stream = str_io_object.read().encode('utf8')       # считывание потока
client.put_object(bucket_name='bucketname',
                  object_name='filename',
                  data=data_stream,
                  length=len(data_stream))
                  
                  
# пример считывания данных из хранилища через объект                
data_object = client.get_object(bucket_name='bucketname',object_name='filename')
# данный метод возвращает urllib3.response.HTTPResponse object
# для получения самих данных необходимо обратиться к атрибуту data
data = data_object.data    # в некоторых случаях придется использовать data_object.data.decode()
```
Другие часто используемые методы:
```Py
# получение списка метаданных для каждого объекта в бакете, 
# в основном используется для получения имен все файлов в бакете
object_list = client.list_objects(bucket_name=bucketname)
for obj in object_list:
    print('имя файла: ', obj.object_name, 
          'размер: ', obj.size, 
          'дата последнего изменения: ', obj.last_modified) # и т.д.


# удаление объекта по названию
client.remove_object(bucket_name=bucketname, object_name=filename)


# удаление некоторого множества объектов по списку названий
client.remove_objects(bucket_name=bucketname, delete_object_list=['name1', 'name2'])


# получение метаданных конкретного объекта
metadata = client.stat_object(bucket_name=bucketname, object_name=filename)
print('имя файла: ', metadata.object_name,
      ', размер: ', metadata.size,
      ', дата последнего изменения: ', metadata.last_modified)  # и т.д.
```
Помимо перечисленных существует множество методов для работы с объектами в хранилище: 
copy, compose, управление тегами и конфигурациями, кодирование и др.

## Использование MinIO в Django проектах
Если вы хотите в Django проекте использовать Minio в качестве хранилища 
по-умолчанию для всех объектов, тогда можно добавить соответствующие настройки 
в файле `settings.py`.
Для этого на пустом месте добавьте следующие строки:  
```Py
STATICFILES_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'bucket_name'     # Бакет должен уже быть создан
AWS_ACCESS_KEY_ID = 'minio'
AWS_SECRET_ACCESS_KEY = 'minio124'
AWS_S3_ENDPOINT_URL = 'http://127.0.0.1:9000'
```
В противном случае используйте описанные ранее методы 
внутри ваших функций без применения дополнительных настроек.  
Также советую поменять часовой пояс, чтобы для MinIO и Django 
они совпадали. Для этого найдите в конце файла параметр `TIME_ZONE`:
```Py
TIME_ZONE = 'Europe/Moscow'
```

## Заключение
Примеры всех вышеперечисленных функций вы можете посмотреть в файле `base_methods.py`.
Однако, там они описаны исключительно в познавательных целях и в таком виде непригодны к использованию.  
Более приближенный к реальности пример приведен в файле `advanced_example.py`.
Там функции обернуты в класс, данные для подключения берутся из файла конфигурации, 
а также реализована обработка ошибок для minio методов через minio.error.S3Error.


## Полезные ссылки
Официальная документация Minio для Python:  
https://min.io/docs/minio/linux/developers/python/API.html  
Официальная документация по библиотеке io для работы с потоками:  
https://docs.python.org/3/library/io.html  
Официальная документация по библиотеке configparser для работы с файлами конфигураций:  
https://docs.python.org/3/library/configparser.html  
Использование Minio для хранения файлов в Django проектах:  
https://emackovenko.ru/django-ispolzovanie-obektnogo-khranilishh/
