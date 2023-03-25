from minio import Minio
import io


def add_new_bucket(name:str):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    client.make_bucket(bucket_name=name)    # создание бакета


def list_all_buckets():
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    list = client.list_buckets()    # возвращает список всех бакетов
    for bucket in list:
        print(bucket)


def does_bucket_exist(name: str) -> bool:
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    if(client.bucket_exists(name)):     # проверяет существование бакета с данным названием
        return True                     # возвращает true или false
    else:
        return False


def delete_bucket(name:str):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    client.remove_bucket(name)  # удаление бакета


def put_object_from_file(bucketname='bucket_name', filepath='temp_file', filename='new_file'):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    client.fput_object(bucket_name=bucketname,
                       object_name=filename,
                       file_path=filepath)


def get_object_from_file(bucketname='bucket_name', filepath='temp_file', filename='new_file'):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    client.fget_object(bucket_name=bucketname,
                       object_name=filename,
                       file_path=filepath)    # после этого необходимо работать с файлами


def put_object_from_stream(bucketname='bucket_name', filename='new_file', some_data='some text or other data'):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    # пример для перевода строковых данных в поток
    str_io_object = io.StringIO(some_data)  # также можно использовать io.BytesIO()
    data_stream = str_io_object.read().encode('utf8')
    client.put_object(bucket_name=bucketname,
                      object_name=filename,
                      data=data_stream,
                      length=len(data_stream))    # или length=-1 для неизвестной длины


def get_object_from_stream(bucketname='bucket_name', filename='new_file'):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    data_object = client.get_object(bucket_name=bucketname,object_name=filename)
    # данный метод возвращает urllib3.response.HTTPResponse object
    # для получения самих данных необходимо обратиться к атрибуту data
    return data_object.data     # в некоторых случаях придется использовать data_object.data.decode()


def list_all_objects(bucketname='bucket_name'):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    object_list = client.list_objects(bucket_name=bucketname)
    for obj in object_list:
        print('имя файла: ', obj.object_name,
              ', размер: ', obj.size,
              ', дата последнего изменения: ', obj.last_modified)   # и другие метаданные


def delete_object(bucketname='bucket_name', filename='file_name'):  # удаление объекта по названию
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    client.remove_object(bucket_name=bucketname, object_name=filename)


def delete_multiple_objects(bucketname='bucket_name', names=['filename1', 'filename2']):  # удаление объектов по списку
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    client.remove_objects(bucket_name=bucketname, delete_object_list=names)


def get_object_metadata(bucketname='bucket_name', filename='file_name'):
    client = Minio(endpoint='localhost:9000', access_key='minio', secret_key='minio124', secure=False)
    metadata = client.stat_object(bucket_name=bucketname, object_name=filename)
    print('имя файла: ', metadata.object_name,
          ', размер: ', metadata.size,
          ', дата последнего изменения: ', metadata.last_modified)  # и другие метаданные
