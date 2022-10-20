# Методические указания по выполнению дз ст [S3 хранилище]
В данном домашнем задании мы познакомимся с хранилищем S3,
обсудим зачем оно нужно, как работает и как правильно его настрить и использовать.
Необходимо настроить файловое хранилище S3 
и разработать методы доступа к нему. Хранилище необходимо для синхронизации двух узлов (условные клиент и сервер облака). Должна быть предусмотрена синхронизация, если одна из версий устарела (на клиенте не было интернета)

## Этап №1
### План:
1. Установить docker
2. Что такое S3. Почему не сохранять все просто на диск?
3. Разобрать конфигурацию кластера s3 в docker-compose и установить.
4. Разобраться во внутренней конфигурации панели администратора minio
5. Бакеты. Создать свой первый бакет, загрузить файл и сгенерировать ссылку на файл в хранилище.

### 1. Установка docker
Полезные материалы:
- Про docker: https://habr.com/ru/post/310460/?ysclid=l7ilstl2mt144186154
- Официальная документация docker: https://docs.docker.com/get-started/overview/

Для начала введем для себя 3 определения:
* Docker - Программное обеспечение для автоматизации развёртывания и управления приложениями в средах с поддержкой контейнеризации, контейнеризатор приложений. Позволяет «упаковать» приложение со всем его окружением и зависимостями в контейнер.
  Говоря простым языком - это программа, позволяющая упаковывать ваши приложения так, чтобы вы не замечали разницу между языками,
  легко обменивались программным обеспечением.
* Docker контейнер - сущности,
  которые предоставляют схожий с виртуальными машинами уровень изоляции,
  но благодаря правильному задействованию низкоуровневых механизмов основной операционной системы делают это с в разы меньшей нагрузкой.
* Docker image - "образ" какого-то контейнера, контейнер который один разработчик передает другому в формате image`a


Приступим непосредственно к установке:
Один из самых важных навыков программиста - способность читать и понимать то, что вы должны сделать,
потому постараюсь обойти подробную информацию о том как нажать на кнопочку скачать и как переводить тест на сайте.

[Windows](https://docs.docker.com/desktop/install/windows-install/)
[Linux](https://docs.docker.com/desktop/install/linux-install/)
[MacOS](https://docs.docker.com/desktop/install/mac-install/)

Проверим его работоспособность:

Откройте консоль. Введите команду
```shell
$ docker version
Client:
 Cloud integration: v1.0.22
 Version:           20.10.12
 API version:       1.41
 Go version:        go1.16.12
 Git commit:        e91ed57
 Built:             Mon Dec 13 11:46:56 2021
 OS/Arch:           darwin/arm64
 Context:           default
 Experimental:      true

Server: Docker Desktop 4.5.0 (74594)
 Engine:
  Version:          20.10.12
  API version:      1.41 (minimum version 1.12)
  Go version:       go1.16.12
  Git commit:       459d0df
  Built:            Mon Dec 13 11:43:07 2021
  OS/Arch:          linux/arm64
  Experimental:     false
 containerd:
  Version:          1.4.12
  GitCommit:        7b11cfaabd73bb80907dd23182b9347b4245eb5d
 runc:
  Version:          1.0.2
  GitCommit:        v1.0.2-0-g52b36a2
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
```
Если вдруг по какой-то причине вы видите ошибку, например:
```shell
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```
Значит что-то пошло не так, если вы не найдете свою проблему в FAQ, постарайтесь сначала поискать ее в интернете.

Вместе с программой докер, к вам должен был установиться docker compose. Проверим его установку:
```shell
$ docker compose version
Docker Compose version v2.2.3
# или, возможно, у вас сработает эта команда
# проблема различия возникает из-за версии приложения и ОС
$ docker-compose version
docker-compose version 1.29.2, build 5becea4c
docker-py version: 5.0.0
CPython version: 3.9.0
OpenSSL version: OpenSSL 1.1.1h  22 Sep 2020
```

### 2. Что такое S3. Почему не сохранять все просто на диск?
S3 - облачный сервис для надежного хранения любых типов данных, резервного копирования и архивирования.

Для каких задач подходит «Объектное хранилище S3»?
* Хранение файлов, необходимых для работы сайтов и мобильных приложений.
* Создание архивов больших объемов данных.
* Хранение статического контента и мультимедийных файлов.
* Хранение пользовательских данных и резервных копий.
* Раздача статических файлов.
* Хранение данных backend-платформ.
* Интеграция с системами электронного документооборота.
* Хранение лог-файлов.

Почему просто не сохранять файлы на диск? 

Ответ достаточно прост: 

* отсутсвие простого горизонтального масштабирования(вы конечно можете использовать протоколы по типу sftp и отправлять файлы на разные машины, но это определенно требует новых доработок со стороны кода)
* отсуствие встроенной репликации данных(придется решать эту проблему своими силами)
* сложная и проблематичная интеграция
* надженость хранения(что произойдет если 1 диск на котором вы хранили файлы сломается?)

Архитектура minio же изначально поразумевает автоматическую реплизацию(они повторяются елси один из серверов сломался, ответит второй. все конечно зависит от фактора репликации - количество копий, которые вы будете хранить) ваших данных.
![Создание проекта](docs/4.png)
![Создание проекта](docs/2.png)

### 3. Разобрать конфигурацию кластера s3 в docker-compose и установить.
Давайте составим архитектуру проекта, который будем конфигурировать для 1 этапа:
![Создание проекта](docs/1.png)
Разберем его по частям: 
1. Необходимо сконфигурировать кластер minio. 
2. Нам подребуется веб сервер nginx, который будет работать в режиме балансировщика кластера. Он будет переадресовывать ваши запросы внутрь кластера minio 
3. Пользователь будет заходить в nginx. Nginx будет проксировать запрос внутрь одной из нод minio.

В корне данного проекта вы можете найти cледующие файлы:
 ```docker-compose.yaml```, ```nginx.conf```

Разберем конфигурацию nginx:
```nginx
# определяет учетные данные пользователя и группы, используемые рабочими процессами. Если группа опущена, используется группа, имя которой = имени пользователя.
user  nginx; 
# Определяет количество рабочих процессов.
# Оптимальное значение зависит от многих факторов, включая (но не ограничиваясь ими) количество ядер процессора, количество жестких дисков, на которых хранятся данные, и структуру загрузки.
# Если кто-то сомневается в выбранном значении, хорошим началом было бы установить его на количество доступных ядер процессора (значение “auto” попытается автоматически определить его).
worker_processes  auto;

# то куда будут записываться ваши log файлы. сейчас мы сохраняем ошибки warn уровня
error_log  /var/log/nginx/error.log warn; 
# путь до pid файла
pid        /var/run/nginx.pid;

# Задает максимальное количество одновременных подключений, которые могут быть открыты процессом.
events {
    worker_connections  4096;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    keepalive_timeout  65;

    # include /etc/nginx/conf.d/*.conf;

    # устанавливаем адреса s3 api в кластере
    upstream minio {
        server minio1:9000;
        server minio2:9000;
        server minio3:9000;
        server minio4:9000;
    }

    # устанавливаем адреса консолей в кластере
    upstream console {
        ip_hash;
        server minio1:9001;
        server minio2:9001;
        server minio3:9001;
        server minio4:9001;
    }

    server {
        # слушаем 9000 порт
        listen       9000;
        listen  [::]:9000;
        server_name  localhost;

        # To allow special characters in headers
        ignore_invalid_headers off;
        # Allow any size file to be uploaded.
        # Set to a value such as 1000m; to restrict file size to a specific value
        client_max_body_size 0;
        # To disable buffering
        proxy_buffering off;
        proxy_request_buffering off;

        location / {
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            proxy_connect_timeout 300;
            # Default is HTTP/1, keepalive is only enabled in HTTP/1.1
            proxy_http_version 1.1;
            proxy_set_header Connection "";
            chunked_transfer_encoding off;

            # переадресовывапем на upstream(несколько адресов) кластера.
            # nginx сам выполнит балансировку.
            proxy_pass http://minio;
        }
    }

    server {
        # слушаем порт 9001
        listen       9001;
        listen  [::]:9001;
        server_name  localhost;

        # To allow special characters in headers
        ignore_invalid_headers off;
        # Allow any size file to be uploaded.
        # Set to a value such as 1000m; to restrict file size to a specific value
        client_max_body_size 0;
        # To disable buffering
        proxy_buffering off;
        proxy_request_buffering off;

        location / {
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header X-NginX-Proxy true;

            # This is necessary to pass the correct IP to be hashed
            real_ip_header X-Real-IP;

            proxy_connect_timeout 300;

            # To support websocket
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";

            chunked_transfer_encoding off;
            # переадресовываем в один из адресов upstream console
            proxy_pass http://console;
        }
    }
}
```
Разберем конфигурацию docker-compose:
```yaml
# устанавливаем версию в соотвествии с необходимой нам
# подробнее на https://docs.docker.com/compose/compose-file/compose-versioning/
version: '3.7'

# настройки и конфигурации, общие для всех контейнеров
x-minio-common: &minio-common
  image: quay.io/minio/minio:RELEASE.2022-10-15T19-57-03Z # устанавливаем image
  # команда которая выполняется при запуске контейнера
  # --console-address ":9001" - указываем запустить консоль администратора на порту 9001
  #  http://minio{1...4}/data{1...2}  - указывает ноде адреса других нод,
  # чтобы они могли связаться между собой
  # если сломается одна из нод,
  # остальные ноды это поймут и будут предпринимать действия чтобы сохранить файлы
  command: server --console-address ":9001" http://minio{1...4}/data{1...2} 
  environment: # env конфигурация, подробнее: https://github.com/KaymeKaydex/web-2022/tree/go-lab2/tutorials/lab2/golang#поговорим-про-переменные-окружения
    MINIO_ACCESS_KEY: minio # пароль админа
    MINIO_SECRET_KEY: minio124 # логин админа
  expose:
    - "9000" # открыть порты
    - "9001"
    # environment:
    # MINIO_ROOT_USER: minioadmin
    # MINIO_ROOT_PASSWORD: minioadmin
  healthcheck: # проверка состояния работоспособности кластера происходит путем выполнения get запроса на http://localhost:9000/minio/health/live
    test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
    interval: 30s
    timeout: 20s
    retries: 3

# запускает 4 контейнера docker, в которых запущены экземпляры сервера minio.
# используя обратный прокси-сервер nginx, балансировку нагрузки, вы можете получить доступ
# через порт 9000.
services:
  minio1:
    <<: *minio-common
    hostname: minio1 # указываем что адрес внутри подсети docker будет http://minio1:9000/ и на порту 9001 для админки соотвественно
    volumes: # куда физически переадресовать* память(в какие разделы) из виртуальной(в докере) на вашу машину. по сути это работает как хард линк на файл/папку
      - data1-1:/data1
      - data1-2:/data2

  minio2: # аналогично ставим 2-4 ноды
    <<: *minio-common
    hostname: minio2
    volumes:
      - data2-1:/data1
      - data2-2:/data2

  minio3:
    <<: *minio-common
    hostname: minio3
    volumes:
      - data3-1:/data1
      - data3-2:/data2

  minio4:
    <<: *minio-common
    hostname: minio4
    volumes:
      - data4-1:/data1
      - data4-2:/data2

  nginx: # наш еще один сервис в подсети docker будет nginx 
    image: nginx:1.19.2-alpine # исходники сервиса взять отсюда
    hostname: nginx # hostname внутри подсети docker будет nginx
    volumes:
      # куда физически переадресовать* память(в какие разделы) из виртуальной(в докере) на вашу машину. по сути это работает как хард линк на файл/папку. 
      # доступ даем на ro (read only)
      - ./nginx.conf:/etc/nginx/nginx.conf:ro 
    ports:
      - "9000:9000" # форвардим порт 9000 из нашей локальной сети(localhost) (forward port) на исхоодный(внутри подсети docker)(source port)
      - "9001:9001" # левый порт - порт вашей локальной сети компьютера, таргетный. порт справа - соурс порт - порт внутри подсети докера. 
    depends_on: # не запускай nginx пока не запустится весь кластер minio
      - minio1
      - minio2
      - minio3
      - minio4

## По умолчанию в этой конфигурации используется локальный драйвер docker по умолчанию,
## Для пользовательских томов замените на конфигурацию драйвера тома.
volumes:
  data1-1:
  data1-2:
  data2-1:
  data2-2:
  data3-1:
  data3-2:
  data4-1:
  data4-2:
```
Разберитесь с каждой строчкой которая была употреблена, чтобы для вас это не казалось магией.
Наша конфигурация кластера готова.
Попробуем запустить!

(не вводите символ # или $ в командах. Это просто строка приглашения.
$ означает что вы работаете под обычным пользователем, а # - под рутом. Это и есть его основное назначение, никаких дополнительных функций в этом символе нет.)

Зайдите в папку этого репозитория и проверьте что все файлы, которые мы обсудили в наличии:
```shell
$ ls -la
total 80
drwxr-xr-x  12 maxim-konovalov  staff    384 Oct 16 16:07 .
drwxr-xr-x  10 maxim-konovalov  staff    320 Oct 16 14:46 ..
drwxr-xr-x  13 maxim-konovalov  staff    416 Oct 16 15:30 .git
-rw-r--r--   1 maxim-konovalov  staff    274 Oct 16 14:48 .gitignore
drwxr-xr-x   7 maxim-konovalov  staff    224 Oct 16 15:33 .idea
-rw-r--r--   1 maxim-konovalov  staff   1072 Oct 16 14:46 LICENSE
-rw-r--r--   1 maxim-konovalov  staff  20142 Oct 16 16:07 README.md
drwxr-xr-x   3 maxim-konovalov  staff     96 Oct 16 14:48 cmd
-rw-r--r--   1 maxim-konovalov  staff   1654 Oct 16 13:25 docker-compose.yml
drwxr-xr-x   6 maxim-konovalov  staff    192 Oct 16 15:27 docs
-rw-r--r--   1 maxim-konovalov  staff     22 Oct  9 21:19 go.mod
-rw-r--r--   1 maxim-konovalov  staff   3046 Oct 16 13:15 nginx.conf
```
Запустим с помощью docker compose нашу документацию
```shell
$ docker compose up # укажите еще флаг -d чтобы все запустилось в режиме демона
[+] Running 6/5
 ⠿ Network minio-lecture_default     Created                                                                                                                           0.0s
 ⠿ Container minio-lecture-minio2-1  Created                                                                                                                           0.1s
 ⠿ Container minio-lecture-minio4-1  Created                                                                                                                           0.1s
 ⠿ Container minio-lecture-minio3-1  Created                                                                                                                           0.1s
 ⠿ Container minio-lecture-minio1-1  Created                                                                                                                           0.1s
 ⠿ Container minio-lecture-nginx-1   Created                                                                                                                           0.0s
Attaching to minio-lecture-minio1-1, minio-lecture-minio2-1, minio-lecture-minio3-1, minio-lecture-minio4-1, minio-lecture-nginx-1
minio-lecture-minio2-1  | WARNING: MINIO_ACCESS_KEY and MINIO_SECRET_KEY are deprecated.
minio-lecture-minio2-1  |          Please use MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | API: SYSTEM()
minio-lecture-minio2-1  | Time: 13:09:14 UTC 10/16/2022
minio-lecture-minio2-1  | Error: Marking minio4:9000 offline temporarily; caused by Post "http://minio4:9000/minio/storage/data1/v49/readall?disk-id=&file-path=format.json&volume=.minio.sys": dial tcp 192.168.176.5:9000: connect: connection refused (*fmt.wrapError)
minio-lecture-minio2-1  |        9: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio2-1  |        8: internal/logger/logonce.go:104:logger.(*logOnceType).logOnceIf()
minio-lecture-minio2-1  |        7: internal/logger/logonce.go:135:logger.LogOnceIf()
minio-lecture-minio2-1  |        6: internal/rest/client.go:253:rest.(*Client).Call()
minio-lecture-minio2-1  |        5: cmd/storage-rest-client.go:151:cmd.(*storageRESTClient).call()
minio-lecture-minio2-1  |        4: cmd/storage-rest-client.go:538:cmd.(*storageRESTClient).ReadAll()
minio-lecture-minio2-1  |        3: cmd/format-erasure.go:396:cmd.loadFormatErasure()
minio-lecture-minio2-1  |        2: cmd/format-erasure.go:332:cmd.loadFormatErasureAll.func1()
minio-lecture-minio2-1  |        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | API: SYSTEM()
minio-lecture-minio2-1  | Time: 13:09:14 UTC 10/16/2022
minio-lecture-minio2-1  | Error: Marking minio1:9000 offline temporarily; caused by Post "http://minio1:9000/minio/storage/data1/v49/readall?disk-id=&file-path=format.json&volume=.minio.sys": dial tcp 192.168.176.3:9000: connect: connection refused (*fmt.wrapError)
minio-lecture-minio2-1  |        9: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio2-1  |        8: internal/logger/logonce.go:104:logger.(*logOnceType).logOnceIf()
minio-lecture-minio2-1  |        7: internal/logger/logonce.go:135:logger.LogOnceIf()
minio-lecture-minio2-1  |        6: internal/rest/client.go:253:rest.(*Client).Call()
minio-lecture-minio2-1  |        5: cmd/storage-rest-client.go:151:cmd.(*storageRESTClient).call()
minio-lecture-minio2-1  |        4: cmd/storage-rest-client.go:538:cmd.(*storageRESTClient).ReadAll()
minio-lecture-minio2-1  |        3: cmd/format-erasure.go:396:cmd.loadFormatErasure()
minio-lecture-minio2-1  |        2: cmd/format-erasure.go:332:cmd.loadFormatErasureAll.func1()
minio-lecture-minio2-1  |        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | API: SYSTEM()
minio-lecture-minio2-1  | Time: 13:09:14 UTC 10/16/2022
minio-lecture-minio2-1  | Error: Marking minio3:9000 offline temporarily; caused by Post "http://minio3:9000/minio/storage/data2/v49/readall?disk-id=&file-path=format.json&volume=.minio.sys": dial tcp 192.168.176.4:9000: connect: connection refused (*fmt.wrapError)
minio-lecture-minio2-1  |        9: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio2-1  |        8: internal/logger/logonce.go:104:logger.(*logOnceType).logOnceIf()
minio-lecture-minio2-1  |        7: internal/logger/logonce.go:135:logger.LogOnceIf()
minio-lecture-minio2-1  |        6: internal/rest/client.go:253:rest.(*Client).Call()
minio-lecture-minio2-1  |        5: cmd/storage-rest-client.go:151:cmd.(*storageRESTClient).call()
minio-lecture-minio2-1  |        4: cmd/storage-rest-client.go:538:cmd.(*storageRESTClient).ReadAll()
minio-lecture-minio2-1  |        3: cmd/format-erasure.go:396:cmd.loadFormatErasure()
minio-lecture-minio2-1  |        2: cmd/format-erasure.go:332:cmd.loadFormatErasureAll.func1()
minio-lecture-minio2-1  |        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | API: SYSTEM()
minio-lecture-minio2-1  | Time: 13:09:14 UTC 10/16/2022
minio-lecture-minio2-1  | Error: Read failed. Insufficient number of drives online (*errors.errorString)
minio-lecture-minio2-1  |        6: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio2-1  |        5: cmd/prepare-storage.go:242:cmd.connectLoadInitFormats()
minio-lecture-minio2-1  |        4: cmd/prepare-storage.go:282:cmd.waitForFormatErasure()
minio-lecture-minio2-1  |        3: cmd/erasure-server-pool.go:109:cmd.newErasureServerPools()
minio-lecture-minio2-1  |        2: cmd/server-main.go:708:cmd.newObjectLayer()
minio-lecture-minio2-1  |        1: cmd/server-main.go:533:cmd.serverMain()
minio-lecture-minio1-1  | WARNING: MINIO_ACCESS_KEY and MINIO_SECRET_KEY are deprecated.
minio-lecture-minio1-1  |          Please use MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
minio-lecture-minio3-1  | WARNING: MINIO_ACCESS_KEY and MINIO_SECRET_KEY are deprecated.
minio-lecture-minio3-1  |          Please use MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
minio-lecture-minio4-1  | WARNING: MINIO_ACCESS_KEY and MINIO_SECRET_KEY are deprecated.
minio-lecture-minio4-1  |          Please use MINIO_ROOT_USER and MINIO_ROOT_PASSWORD
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | API: SYSTEM()
minio-lecture-minio2-1  | Time: 13:09:14 UTC 10/16/2022
minio-lecture-minio2-1  | Error: Read failed. Insufficient number of drives online (*errors.errorString)
minio-lecture-minio2-1  |        6: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio2-1  |        5: cmd/prepare-storage.go:242:cmd.connectLoadInitFormats()
minio-lecture-minio2-1  |        4: cmd/prepare-storage.go:302:cmd.waitForFormatErasure()
minio-lecture-minio2-1  |        3: cmd/erasure-server-pool.go:109:cmd.newErasureServerPools()
minio-lecture-minio2-1  |        2: cmd/server-main.go:708:cmd.newObjectLayer()
minio-lecture-minio2-1  |        1: cmd/server-main.go:533:cmd.serverMain()
minio-lecture-minio2-1  | Waiting for a minimum of 4 drives to come online (elapsed 0s)
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | Client 'http://minio1:9000/minio/storage/data2/v49' re-connected in 188.502ms
minio-lecture-minio4-1  | 
minio-lecture-minio4-1  | API: SYSTEM()
minio-lecture-minio4-1  | Time: 13:09:14 UTC 10/16/2022
minio-lecture-minio4-1  | Error: Marking minio3:9000 offline temporarily; caused by Post "http://minio3:9000/minio/storage/data1/v49/readall?disk-id=&file-path=format.json&volume=.minio.sys": dial tcp 192.168.176.4:9000: connect: connection refused (*fmt.wrapError)
minio-lecture-minio4-1  |        9: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio4-1  |        8: internal/logger/logonce.go:104:logger.(*logOnceType).logOnceIf()
minio-lecture-minio4-1  |        7: internal/logger/logonce.go:135:logger.LogOnceIf()
minio-lecture-minio4-1  |        6: internal/rest/client.go:253:rest.(*Client).Call()
minio-lecture-minio4-1  |        5: cmd/storage-rest-client.go:151:cmd.(*storageRESTClient).call()
minio-lecture-minio4-1  |        4: cmd/storage-rest-client.go:538:cmd.(*storageRESTClient).ReadAll()
minio-lecture-minio4-1  |        3: cmd/format-erasure.go:396:cmd.loadFormatErasure()
minio-lecture-minio4-1  |        2: cmd/format-erasure.go:332:cmd.loadFormatErasureAll.func1()
minio-lecture-minio4-1  |        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
minio-lecture-minio2-1  | Client 'http://minio4:9000/minio/storage/data1/v49' re-connected in 207.869833ms
minio-lecture-minio2-1  | Client 'http://minio4:9000/minio/storage/data2/v49' re-connected in 208.1285ms
minio-lecture-minio4-1  | Waiting for all MinIO sub-systems to be initialized.. lock acquired
minio-lecture-minio2-1  | Client 'http://minio4:9000/minio/storage/data1/v49' re-connected in 86.2515ms
minio-lecture-minio4-1  | Client 'http://minio3:9000/minio/storage/data2/v49' re-connected in 60.504583ms
minio-lecture-minio2-1  | Client 'http://minio3:9000/minio/storage/data1/v49' re-connected in 117.823375ms
minio-lecture-minio4-1  | Automatically configured API requests per node based on available memory on the system: 37
minio-lecture-minio2-1  | Client 'http://minio3:9000/minio/storage/data2/v49' re-connected in 133.205042ms
minio-lecture-minio4-1  | All MinIO sub-systems initialized successfully in 76.677083ms
minio-lecture-minio2-1  | Client 'http://minio1:9000/minio/storage/data1/v49' re-connected in 291.779417ms
minio-lecture-minio2-1  | Client 'http://minio3:9000/minio/storage/data1/v49' re-connected in 295.254208ms
minio-lecture-minio1-1  | Waiting for all MinIO sub-systems to be initialized.. lock acquired
minio-lecture-minio4-1  | Client 'http://minio3:9000/minio/storage/data1/v49' re-connected in 105.200417ms
minio-lecture-minio2-1  | Client 'http://minio1:9000/minio/storage/data2/v49' re-connected in 156.731042ms
minio-lecture-minio2-1  | Client 'http://minio4:9000/minio/storage/data2/v49' re-connected in 161.032667ms
minio-lecture-minio4-1  | Client 'http://minio3:9000/minio/lock/v7' re-connected in 116.688709ms
minio-lecture-minio2-1  | Client 'http://minio3:9000/minio/storage/data2/v49' re-connected in 349.319333ms
minio-lecture-minio2-1  | Client 'http://minio1:9000/minio/storage/data1/v49' re-connected in 201.184416ms
minio-lecture-nginx-1   | /docker-entrypoint.sh: /docker-entrypoint.d/ is not empty, will attempt to perform configuration
minio-lecture-nginx-1   | /docker-entrypoint.sh: Looking for shell scripts in /docker-entrypoint.d/
minio-lecture-nginx-1   | /docker-entrypoint.sh: Launching /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
minio-lecture-nginx-1   | 10-listen-on-ipv6-by-default.sh: Getting the checksum of /etc/nginx/conf.d/default.conf
minio-lecture-minio4-1  | MinIO Object Storage Server
minio-lecture-minio4-1  | Copyright: 2015-2022 MinIO, Inc.
minio-lecture-minio4-1  | License: GNU AGPLv3 <https://www.gnu.org/licenses/agpl-3.0.html>
minio-lecture-minio4-1  | Version: RELEASE.2022-10-15T19-57-03Z (go1.18.7 linux/arm64)
minio-lecture-minio4-1  | 
minio-lecture-minio4-1  | 
minio-lecture-minio4-1  | API: SYSTEM()
minio-lecture-minio4-1  | Time: 13:09:15 UTC 10/16/2022
minio-lecture-minio4-1  | DeploymentID: 92a93f42-872d-4f31-8182-fdad501c304f
minio-lecture-minio4-1  | Error: drive not found: http://minio3:9000/data1 (*errors.errorString)
minio-lecture-minio4-1  |        3: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio4-1  |        2: cmd/erasure.go:191:cmd.getDisksInfo.func1()
minio-lecture-minio4-1  |        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
minio-lecture-minio4-1  | 
minio-lecture-minio4-1  | API: SYSTEM()
minio-lecture-minio4-1  | Time: 13:09:15 UTC 10/16/2022
minio-lecture-minio4-1  | DeploymentID: 92a93f42-872d-4f31-8182-fdad501c304f
minio-lecture-minio4-1  | Error: drive not found: http://minio3:9000/data2 (*errors.errorString)
minio-lecture-minio4-1  |        3: internal/logger/logger.go:259:logger.LogIf()
minio-lecture-minio4-1  |        2: cmd/erasure.go:191:cmd.getDisksInfo.func1()
minio-lecture-minio4-1  |        1: internal/sync/errgroup/errgroup.go:123:errgroup.(*Group).Go.func1()
minio-lecture-minio4-1  | Use `mc admin info` to look for latest server/drive info
minio-lecture-minio4-1  |  Status:         6 Online, 2 Offline. 
minio-lecture-minio4-1  | API: http://192.168.176.5:9000  http://127.0.0.1:9000 
minio-lecture-minio4-1  | Console: http://192.168.176.5:9001 http://127.0.0.1:9001 
minio-lecture-minio4-1  | 
minio-lecture-minio4-1  | Documentation: https://min.io/docs/minio/linux/index.html
minio-lecture-nginx-1   | 10-listen-on-ipv6-by-default.sh: Enabled listen on IPv6 in /etc/nginx/conf.d/default.conf
minio-lecture-nginx-1   | /docker-entrypoint.sh: Launching /docker-entrypoint.d/20-envsubst-on-templates.sh
minio-lecture-nginx-1   | /docker-entrypoint.sh: Configuration complete; ready for start up
minio-lecture-minio1-1  | Automatically configured API requests per node based on available memory on the system: 37
minio-lecture-minio1-1  | All MinIO sub-systems initialized successfully in 147.445833ms
minio-lecture-minio3-1  | Waiting for all MinIO sub-systems to be initialized.. lock acquired
minio-lecture-minio1-1  | MinIO Object Storage Server
minio-lecture-minio1-1  | Copyright: 2015-2022 MinIO, Inc.
minio-lecture-minio1-1  | License: GNU AGPLv3 <https://www.gnu.org/licenses/agpl-3.0.html>
minio-lecture-minio1-1  | Version: RELEASE.2022-10-15T19-57-03Z (go1.18.7 linux/arm64)
minio-lecture-minio1-1  | 
minio-lecture-minio1-1  | Status:         8 Online, 0 Offline. 
minio-lecture-minio1-1  | API: http://192.168.176.3:9000  http://127.0.0.1:9000 
minio-lecture-minio1-1  | Console: http://192.168.176.3:9001 http://127.0.0.1:9001 
minio-lecture-minio1-1  | 
minio-lecture-minio1-1  | Documentation: https://min.io/docs/minio/linux/index.html
minio-lecture-minio3-1  | Automatically configured API requests per node based on available memory on the system: 37
minio-lecture-minio2-1  | Waiting for all MinIO sub-systems to be initialized.. lock acquired
minio-lecture-minio3-1  | All MinIO sub-systems initialized successfully in 281.016042ms
minio-lecture-minio3-1  | MinIO Object Storage Server
minio-lecture-minio3-1  | Copyright: 2015-2022 MinIO, Inc.
minio-lecture-minio3-1  | License: GNU AGPLv3 <https://www.gnu.org/licenses/agpl-3.0.html>
minio-lecture-minio3-1  | Version: RELEASE.2022-10-15T19-57-03Z (go1.18.7 linux/arm64)
minio-lecture-minio3-1  | 
minio-lecture-minio3-1  | Status:         8 Online, 0 Offline. 
minio-lecture-minio3-1  | API: http://192.168.176.4:9000  http://127.0.0.1:9000 
minio-lecture-minio3-1  | Console: http://192.168.176.4:9001 http://127.0.0.1:9001 
minio-lecture-minio3-1  | 
minio-lecture-minio3-1  | Documentation: https://min.io/docs/minio/linux/index.html
minio-lecture-minio2-1  | Automatically configured API requests per node based on available memory on the system: 35
minio-lecture-minio2-1  | All MinIO sub-systems initialized successfully in 299.530083ms
minio-lecture-minio2-1  | MinIO Object Storage Server
minio-lecture-minio2-1  | Copyright: 2015-2022 MinIO, Inc.
minio-lecture-minio2-1  | License: GNU AGPLv3 <https://www.gnu.org/licenses/agpl-3.0.html>
minio-lecture-minio2-1  | Version: RELEASE.2022-10-15T19-57-03Z (go1.18.7 linux/arm64)
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | Status:         8 Online, 0 Offline. 
minio-lecture-minio2-1  | API: http://192.168.176.2:9000  http://127.0.0.1:9000 
minio-lecture-minio2-1  | Console: http://192.168.176.2:9001 http://127.0.0.1:9001 
minio-lecture-minio2-1  | 
minio-lecture-minio2-1  | Documentation: https://min.io/docs/minio/linux/index.html
```
Зайдем в панель администратора из браузера: http://localhost:9001/login
![Создание проекта](docs/5.png)
Введем пароль и логин, которые мы указали в docker-compose.yml файле и зайдем в панель администратора:
![Создание проекта](docs/6.png)
Проверим что мы все сделали правильно и посмотрим любой исходящий запрос в консоли разработчика:
![Создание проекта](docs/7.png)
Заголовок ответа Server nginx нам явно указывает что наш запрос сначала пошел внутрь nginx`а,
а только после ушел внутрь подсети докера на тот же порт.
В консоли мы можем увидеть следующее(если вы запустили без флага -d):
```shell
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/5926.6813a97f.chunk.js.map HTTP/1.1" 200 22724 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/701.ab5785ea.chunk.js.map HTTP/1.1" 200 19780 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/4455.cdf95486.chunk.js.map HTTP/1.1" 200 87234 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/9467.361c4c5c.chunk.js.map HTTP/1.1" 200 134986 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/5171.e5224ef3.chunk.js.map HTTP/1.1" 200 506010 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/696.c93c6454.chunk.js.map HTTP/1.1" 200 76186 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/css/main.b20a708b.css.map HTTP/1.1" 200 28742 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:12:53 +0000] "GET /static/js/main.c6cd5e83.js.map HTTP/1.1" 200 5148650 "http://localhost:9001/buckets" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:13:13 +0000] "GET /static/js/8277.ffa83ea5.chunk.js HTTP/1.1" 200 14998 "http://localhost:9001/buckets/add-bucket" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:13:13 +0000] "GET /static/js/8277.ffa83ea5.chunk.js.map HTTP/1.1" 200 56877 "http://localhost:9001/buckets/add-bucket" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
minio-lecture-nginx-1   | 192.168.176.1 - - [16/Oct/2022:13:13:13 +0000] "GET /api/v1/buckets HTTP/1.1" 200 17 "http://localhost:9001/buckets/add-bucket" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15" "-"
```
Это логи nginx о входящих запросах.
### 4. Разобраться во внутренней конфигурации панели администратора minio
Консоль MinIO - это богатый графический пользовательский интерфейс,
который обеспечивает функциональность,
аналогичную инструменту командной строки mc. 
В случае если вы являетесь адиминистратором крупного проекта - вы как правило не будете пользоваться GUI,
чтобы не вностить лишнюю и бессмысленную нагрузку на сервер. 
В момент пока вы только учитесь вы можете пользоваться GUI.

Страница консоли MinIO предоставляет представление сегментов в развертывании
Вы можете использовать консоль MinIO для административных задач,
таких как Управление идентификацией и доступом,
Мониторинг показателей и журналов или Настройка сервера.

#### Console Object Browser MinIO
![Создание проекта](docs/8.png)

В разделе Обозревателя объектов консоли отображаются все бакеты и объекты, к которым имеет доступ аутентифицированный пользователь.

Используйте строку поиска для поиска определенных бакетов и объектов. Выберите строку для корзины или объекта для просмотра.

Выберите Create Bucket, чтобы создать новый бакет внутри кластера.
В каждом бакете есть кнопки управления и просмотра.
Выберите Manage, чтобы открыть интерфейс управления для бакета:
    
Некоторые функции управления могут быть недоступны, если аутентифицированный пользователь не имеет необходимых административных разрешений.
   
* В Summary отображается сводная информация о конфигурации бакета. 
* Events view поддерживает настройку событий уведомления с использованием настроенного целевого объекта уведомления.
* Replication поддерживает создание правил репликации бакета на стороне сервера и управление ими.
* Lifecycle поддерживает создание Правил управления жизненным циклом объекта для бакета и управление ими.
* В Access Audit отображаются все политики и пользователи, имеющие доступ к этому сегменту.
* Access Rules поддерживает создание анонимных политик бакета и управление ими для присоединения к бакету или префиксу бакета. Анонимные правила позволяют клиентам получать доступ к корзине(бакету) или префиксу без явной аутентификации с использованием учетных данных пользователя.

Выберите Обзор, чтобы просмотреть содержимое бакета.
Вы можете просматривать и загружать отдельные объекты,
загружать новые объекты или использовать функцию перемотки назад для просмотра только тех версий объекта,
которые существовали на выбранную временную метку.
#### Identity
Раздел Идентификации предоставляет интерфейс управления для пользователей, управляемых MinIO.

Раздел содержит следующие подразделы. Некоторые подразделы могут быть недоступны, если у прошедшего проверку пользователя нет необходимых административных разрешений.
![Создание проекта](docs/9.png)

В разделе Пользователи отображаются все пользователи, управляемые MinIO.

* Этот раздел недоступен для развертываний с использованием внешнего менеджера удостоверений, такого как Active Directory или поставщика, совместимого с OIDC.
* Выберите Создать пользователя, чтобы создать нового пользователя, управляемого MinIO.
* Вы можете назначить группы и политики пользователю во время создания.
* Выберите строку пользователя, чтобы просмотреть сведения об этом пользователе.
* Вы можете просматривать и изменять назначенные пользователю группы и политики.
* Вы также можете просматривать любые учетные записи служб, связанные с пользователем, и управлять ими.

Подробнее ознакомтесь с панелью администратора на официальном сайте с документацией minio: https://min.io/docs/minio/linux/administration/minio-console.html
### 5. Бакеты. Создать свой первый бакет, загрузить файл и сгенерировать ссылку на файл в хранилище. 
Данные в S3-хранилище хранятся в едином формате: в виде объектов, помещенных в бакеты (контейнеры).
Можно сказать что бакет - сущность чем-то похожая на папку 1 уровня.

Нажмите на Create Bucket
![Создание проекта](docs/10.png)
Зададим возможность версионирования файлов. 
Уберем блокировку объектов.
Квота(максимальный размер бакета) тоже нам не нужна.
Правила удаления объектов нам тоже не нужны.
![Создание проекта](docs/11.png)
Мы создали наш первый бакет. Давайте загрузим в него какой-нибудь файл. Нажимаем на upload.

![Создание проекта](docs/12.png)
Файл успешно загружен.
Нажмите на шестеренку и в настройках бакета сделайте ему паблик полиси.
Нажмите на файл левой кнопкой мыши чтобы открыть плашку справа. В ней мы нажмем на кнопку share.
Там сгенерировалась ссылка подобного вида:
```shell
http://192.168.208.4:9000/test/b46xpy.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=HEK3NFWVQ28UQ5PVU0EN%2F20221016%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20221016T145908Z&X-Amz-Expires=604800&X-Amz-Security-Token=eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3NLZXkiOiJIRUszTkZXVlEyOFVRNVBWVTBFTiIsImV4cCI6MTY2NTkzNTkwNCwicGFyZW50IjoibWluaW8ifQ.e9dMHTmnk_Hq83Zo_o0EtQ5LBdRwVZaAkrDhtQiB72dKGwdSPIePX1GDVvyFWRWlCJwSPQoinMBFlcjkRO8YIg&X-Amz-SignedHeaders=host&versionId=bbd197a2-1526-44a6-be74-aea5b0bd323d&X-Amz-Signature=186dddb381e8bb53638b6fc98ac296a0cf5a58e3d24c50d7162e1fb7c4c59f1c
```
Превратим ее в:
```shell
http://127.0.0.1:9000/test/b46xpy.jpg
```
Зайдем на этот адрес и увидим нашу картинку(файлик):
![Создание проекта](docs/13.png)
Теперь у нас есть ссылка на паблик файл в s3 чтобы показать нашему другу!
## Этап №2


