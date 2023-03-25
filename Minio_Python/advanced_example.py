from minio import Minio
from minio.error import S3Error
from config import Config
import io

# здесь Minio выступает в качестве хранилища для сервиса заметок (notes)
# каждому пользователю присваивается свой бакет, а заметки хранятся в виде отдельных файлов
class MinioClass:
    def __init__(self):
        try:
            self.config = Config('minio_config.cfg')
            self.client = Minio(endpoint=self.config['socket'],
                                access_key=self.config['access_key'],
                                secret_key=self.config['secret_key'],
                                secure=False)
        except S3Error as e:
            print("minio error occurred: ", e)
        except Exception as e:
            print("unexpected error: ", e)

    def __del__(self):
        print('minio connection closed')

    def add_user(self, username: str):
        try:
            print(username)
            self.client.make_bucket(username)
        except S3Error as e:
            print("minio error occurred: ", e)
        except Exception as e:
            print("unexpected error: ", e)

    def add_note(self, username: str, title: str, content=""):
        str_io_object = io.StringIO(content)
        b_content = str_io_object.read().encode('utf8')
        try:
            result = self.client.put_object(bucket_name=username,
                                            object_name=title,
                                            data=io.BytesIO(b_content),
                                            length=len(content))
        except S3Error as e:
            print("minio error occurred: ", e)
        except Exception as e:
            print("unexpected error: ", e)

    def get_note_list(self, username: str):
        list_of_titles = []
        try:
            note_list = self.client.list_objects(bucket_name=username)
            for note in note_list:
                list_of_titles.append(note.object_name)
                return list_of_titles
            return
        except S3Error as e:
            print("minio error occurred: ", e)
        except Exception as e:
            print("unexpected error: ", e)

    def get_note(self, username: str, title: str):
        try:
            result = self.client.get_object(bucket_name=username,
                                            object_name=title)
            return result.data
        except S3Error as e:
            print("minio error occurred: ", e)
        except Exception as e:
            print("unexpected error: ", e)

    def remove_note(self, username:str, title:str):
        try:
            result = self.client.remove_object(bucket_name=username, object_name=title)
        except S3Error as e:
            print("minio error occurred: ", e)
        except Exception as e:
            print("unexpected error: ", e)
