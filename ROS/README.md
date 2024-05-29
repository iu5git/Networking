
Для начала работы потребуется Ubuntu Focal (20.04) . Именно Ubuntu Focal (20.04), другие версии не подойдут. 

*Предупреждение: Если у вас apple silicon или видеокарта AMD, то gazebo, rviz и rqt могут работать некорректно.*

## Основные команды
**roscore** - запуск ядра ROS

**rostopic list** - просмотр всех запущенных топиков

**source devel/setup.bash** - инициализация констант и переменных среды для работы с ROS в конкретной сущности терминала 

**rosrun** - позволяет запускать исполняемый файл (ноду) в произвольном пакете из любого места без указания его имени.

**roslaunch** - позволяет запускать .launch файлы, в которых может быть много различных нод.

**catkin_make** - билд проекта

**rqt** - запуск утилиты rqt

## Краткая справка о ROS

В ROS отдельная подпрограмма (нода) отвечает за определенную функцию. Отдельная подпрограмма включается в систему как узел, передача информации между узлами происходит с помощью каналов или топиков(topic), посредством сообщений (msg). В ROS существуют свои типы сообщений, например сообщение с данными о перемещении имеет тип Twist, который включает в себя линейную и угловую составляющую.

Каждый отдельный узел может публиковать информацию в топик или подписываться на получение информации из топика. Таким образом, используется модель Publisher-Subscriber 

ROS имеет множество встроенных пакетов для навигации, обработки и передачи изображений и видео, записи/воспроизведения звука, контроля движения. Иногда для реализации функции достаточно просто правильно настроить уже встроенный пакет.

С помощью ROS можно создать общую сеть для нескольких устройств или сущностей ROS, таким образом можно управлять роем небольших роботов, а все вычисления производить на [удаленном сервере](http://wiki.ros.org/ROS/Tutorials/MultipleMachines), используя [vpn](https://husarnet.com/docs).

## Установка ROS
Мы будем использовать версию ROS Noetic
Официальная [инструкция](http://wiki.ros.org/noetic/Installation/Ubuntu) по установке ROS
###### Устанавливаем ключи
```bash
sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
	
sudo apt install curl 
	
curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -
```
  
<!-- ![[Pasted_image_20230228162208.png]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/Pasted_image_20230228162208.png)
###### Устанавливаем ROS
```bash
sudo apt update
sudo apt install ros-noetic-desktop
echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
source ~/.bashrc
sudo apt-get install python3-rosdep
```
<!-- ![[Pasted_image_20230228162915.png]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/Pasted_image_20230228162915.png)
  Установим пакет rosdep, который позволяет вам легко устанавливать системные зависимости для компилируемого исходного кода и необходим для запуска некоторых основных компонентов в ROS:	
```bash
rosdep update
```

###### Устанавливаем Gazebo
```bash
sudo apt-get install ros-noetic-gazebo-ros-pkgs ros-noetic-gazebo-ros-control
```

Для дальнейшей работы также должен быть установлен git
```bash
sudo apt install git
```
## Симуляция робота
###### Cоздание просто модуля ROS

Для работы с инструментами и модулями ROS необходимо описать робота, его составные части и их связи. Для этого используется специальный формат URDF (Unified Robot Description Format).

Важно описать каждую часть робота подробно, поскольку это используется для визуализации модели робота при навигации. Формат URDF включает элементы, которые предназначены для описания жесткий связей частей робота, их внешний вид, включая форму, материал, положение в пространстве, визуальную модель, также существуют элементы для описания сочленений и шарниров, связи моторов и сочленений, элементы, описывающие область коллизии.

Пример описания:
<!-- ![[telegram-cloud-photo-size-2-5303313991357027981-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027981-y.jpg)
Описывать робота с 0 очень трудоемко, поэтому мы будем использовать готовое описание популярной модели робота turtlebot3 burger

```bash
mkdir test_turtlebot && cd test_turtlebot/
mkdir src && cd src
```

  скачиваем файлы с описанием робота
```bash
git clone https://github.com/ROBOTIS-GIT/turtlebot3.git
git clone https://github.com/ROBOTIS-GIT/turtlebot3_msgs.git
git clone https://github.com/ROBOTIS-GIT/turtlebot3_simulations.git
cd ..

```
Для сборки модуля используется catkin, для того чтобы новые изменения вступили в силу нужно будет повторить билд.
```bash
catkin_make
```
<!-- ![[telegram-cloud-photo-size-2-5303313991357027748-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027748-y.jpg)
###### Запуск ROS
Для того чтобы начать работать с ROS нужно запустить его ядро, откроем новый терминал и выполним
  ```bash
roscore
```
<!-- ![[telegram-cloud-photo-size-2-5303313991357027990-x.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027990-x.jpg)
###### Запуск Gazebo
Gazebo - средство симуляции встроенное в ROS
Откроем новый терминал и запустим симуляцию с простой визуализацией модели робота
```bash
source devel/setup.bash
export TURTLEBOT3_MODEL=burger
roslaunch turtlebot3_gazebo turtlebot3_empty_world.launch
```

<!-- ![[telegram-cloud-photo-size-2-5303313991357027755-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027755-y.jpg)
В gazebo можно добавить дополнительные препятствия или добавить преград и помещения для тестирования навигации.
```bash
roslaunch turtlebot3_gazebo turtlebot3_empty_world.launch
```
<!-- ![[telegram-cloud-photo-size-2-5303313991357028046-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357028046-y.jpg)
###### Запуск модуля управления 
Для того, чтобы передавать роботу команды необходимо отправлять сообщения в соответствующие топики.
Посмотреть все запущенные топики можно с помощью команды rostopic list 
<!-- ![[telegram-cloud-photo-size-2-5303313991357027759-x.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027759-x.jpg)

В нашем роботе для управления движением используется топик /cmd_vel
В ROS встроена программа rqt, запустим ее выполним в новом терминале команду rqt, откроется пустое окно.
<!-- ![[telegram-cloud-photo-size-2-5303313991357027779-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027779-y.jpg)
Далее в интерфейсе наверху в панели выберем Plugins->Robot Tools->Robot Steering и  Plugins->Topics->Message Publisher
<!-- ![[telegram-cloud-photo-size-2-5303313991357027756-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027756-y.jpg)
Попробуйте передвинуть ползунки в Robot Steering. Также можно отправить сообщение напрямую c Message Publisher, выберите топик /cmd_vel и нажмите "+".
Чтобы отправить сообщение роботу, нужно нажать галочку рядом с топиком и указать значение в поле expression.
Пример сообщения для движения вперед.
<!-- ![[telegram-cloud-photo-size-2-5303313991357027791-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027791-y.jpg)
Просмотреть текущие сообщения в топиках можно с помощью  Plugins->Topics->Topic Monitor
<!-- ![[telegram-cloud-photo-size-2-5303313991357027793-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027793-y.jpg)

Запустим отдельный узел ROS для управления роботом при помощи клавиатуры. Для этого откроем новый терминал перейдем в папку test_turtlebot/
и выполним команды:
```bash
source devel/setup.bash
export TURTLEBOT3_MODEL=burger
roslaunch turtlebot3_teleop turtlebot3_teleop_key.launch
```
<!-- ![[telegram-cloud-photo-size-2-5303313991357028017-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357028017-y.jpg)
Теперь можно управлять роботом при помощи wasdx
## Создание веб-приложения для управления роботом

Цель создания приложения - управление движением робота при помощи веб интерфейса. Создади
##### Шаг 1.
Создадим проект джанго с именем server
Пример создания проекта Django в VS Code можно просмотреть по данной [ссылке](https://github.com/iu5git/Web/blob/main/tutorials/lab1-py/lab1_tutorial.md)
##### Шаг 2. 
Создадим приложение control внутри нашего проекта джанго.
```bash
python3 manage.py startapp control
```

###### Добавим в файл server/settings.py наше приложение control
	INSTALLED_APPS = [
	    'django.contrib.admin',
	    'django.contrib.auth',
	    'django.contrib.contenttypes',
	    'django.contrib.sessions',
	    'django.contrib.messages',
	    'django.contrib.staticfiles',
	    'server',
	    'control',
	]

######  В файле server/urls.py укажем ссылку на приложение control
	from django.contrib import admin
	from django.urls import path, include
	from . import views
	urlpatterns = [
	    path('admin/', admin.site.urls),
	    path('control-ajax/', include('control.urls')),
	]

######  В файле control/urls.py укажем url для управления роботом
	from django.urls import path
	from . import views
	urlpatterns = [
	    path('move/', views.control, name='control'),
	]

######  В файле control/views.py добавим код:
	from django.http import JsonResponse
	from django.views.decorators.csrf import csrf_exempt
	import json
	from turtlesim.msg import Pose
	from std_msgs.msg import Float64
	from geometry_msgs.msg import Twist
	import rospy 
	  
	@csrf_exempt
	
	def control(request):
	    if request.method == 'POST':
	        try:
	            data = json.loads(request.body)
	            direction = data.get('direction')
	
	            if direction == 'forward':    
	                return JsonResponse({'status': 'Moving forward'})
	            elif direction == 'backward':
	                # Add  robot control code here for moving backward
	                return JsonResponse({'status': 'Moving backward'})
	            elif direction == 'rotate_left':
	                # Add  robot control code here for rotating left
	                return JsonResponse({'status': 'Rotating left'})
	            elif direction == 'rotate_right':
	                # Add  robot control code here for rotating right
	                return JsonResponse({'status': 'Rotating right'})
	            else:
	                return JsonResponse({'error': 'Invalid direction'}, status=400)
	        except json.JSONDecodeError:
	            return JsonResponse({'error': 'Invalid JSON'}, status=400)
	    else:
	        return JsonResponse({'error': 'Invalid request method'}, status=405)
######  Перейдем в Postman 
	Отправим POST запрос по url  http://127.0.0.1:8000/control-ajax/move/ 
	
	C телом JSON
	
	{
	    "direction": "forward"
	}

<!-- ![[telegram-cloud-photo-size-2-5368778965214421707-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5368778965214421707-y.jpg)

Передадим команду rotate_right

<!-- ![[telegram-cloud-photo-size-2-5368778965214421709-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5368778965214421709-y.jpg)
######  Добавим взаимодейcтвие с ROS. В файле control/views.py добавим код:
	from django.http import JsonResponse
	from django.views.decorators.csrf import csrf_exempt
	import json
	from turtlesim.msg import Pose
	from std_msgs.msg import Float64
	from geometry_msgs.msg import Twist
	import rospy 
	rospy.init_node('talker', anonymous=True)
	@csrf_exempt
	
	def control(request):
	    if request.method == 'POST':
	        try:
	            data = json.loads(request.body)
	            direction = data.get('direction')
	
	            if direction == 'forward':
	                # --------------ROS Integration--------------
	                msg = Twist()
	                pub_ = rospy.Publisher('/cmd_vel', Twist)
	                msg.linear.x = 0.1
	                msg.linear.y = 0.0
	                msg.linear.z = 0.0
	                msg.angular.x = 0.0
	                msg.angular.y = 0.0
	                msg.angular.z = 0.0
	                rospy.loginfo("checking for cmd" + str(msg.linear))
	                pub_.publish(msg)
	                # --------------ROS Integration--------------               
	                return JsonResponse({'status': 'Moving forward'})
	            elif direction == 'backward':
	                # Add  robot control code here for moving backward
	                return JsonResponse({'status': 'Moving backward'})
	            elif direction == 'rotate_left':
	                # Add  robot control code here for rotating left
	                return JsonResponse({'status': 'Rotating left'})
	            elif direction == 'rotate_right':
	                # Add  robot control code here for rotating right
	                return JsonResponse({'status': 'Rotating right'})
	            else:
	                return JsonResponse({'error': 'Invalid direction'}, status=400)
	        except json.JSONDecodeError:
	            return JsonResponse({'error': 'Invalid JSON'}, status=400)
	    else:
	        return JsonResponse({'error': 'Invalid request method'}, status=405)
Запустим симуляцию
```bash
cd test_turtlebot/

source devel/setup.bash
export TURTLEBOT3_MODEL=burger
roslaunch turtlebot3_gazebo turtlebot3_empty_world.launch
```

Теперь когда мы отправляем запрос, робот в симуляции двигается вперед, но тк это всего лишь одно сообщение то он просто будет слегка дергаться вперед. Поэтому, для более удобного и практичного управления движением робота следует использовать вебсокет.
##### Шаг 3. Добавляем websocket
Установим daphne, который необходим для запуска асинхронного вебсокет сервера в джанго
```bash
sudo apt install daphne
pip install channels
```

######  В файле views.py добавим код:
	from django.http import HttpResponse
	from django.shortcuts import render

	def control_robot(request):
	    context = {
	        # You can pass any necessary data to the template
	        # For example, the current status of the robot
	        'robot_status': 'Running'  # Replace with actual status
	    }
	    return render(request, 'control.html', context)
######  В файле urls.py укажем ссылку на наш view
	from django.contrib import admin
	from django.urls import path
	from . import views
	urlpatterns = [
	    path('admin/', admin.site.urls),
	    path("", views.control_robot, name="control_robot"),
	]
###### Создадим файл asgi.py
	import os
	from channels.auth import AuthMiddlewareStack
	from channels.routing import ProtocolTypeRouter, URLRouter
	from django.core.asgi import get_asgi_application
	from . import routing
	os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
	application = ProtocolTypeRouter({
	  "http": get_asgi_application(),
	  "websocket": AuthMiddlewareStack(
	        URLRouter(
	            routing.websocket_urlpatterns
	        )
	    ),
	})

###### Создадим файл routing.py, где укажем url для ws подключения
	from django.urls import re_path
	from . import consumer
	websocket_urlpatterns = [
	    re_path(r'ws/robot/$', consumer.RobotConsumer.as_asgi()),
	]


###### Создадим файл consumer.py, в котором содержится основная логика работы с ws и в нем же мы будеи отправлять сообщения в топики ROS
	import json
	from channels.generic.websocket import AsyncWebsocketConsumer
	import rospy
	import websocket
	from turtlesim.msg import Pose
	from std_msgs.msg import Float64
	from geometry_msgs.msg import Twist 
	from types import SimpleNamespace
	
	class RobotConsumer(AsyncWebsocketConsumer):
	    async def connect(self):
	        await self.accept()
	    async def disconnect(self, close_code):
	        pass
	    async def receive(self, text_data):
	        text_data_json = json.loads(text_data)
	        command = text_data_json.get('command')  #sent as JSON
	        await self.send(text_data)
	        # --------------ROS Integration--------------
	        rospy.init_node('talker', anonymous=True)
	        msg = Twist()
	        pub_ = rospy.Publisher('/cmd_vel', Twist)
	        msg.linear.x = 0.1
	        msg.linear.y = 0.0
	        msg.linear.z = 0.0
	        msg.angular.x = 0.0
	        msg.angular.y = 0.0
	        msg.angular.z = 0.0
	        rospy.loginfo("checking for cmd" + str(msg.linear))
	        pub_.publish(msg)
	        # --------------ROS Integration--------------
	        # Here you can process the command and send it to the robot
	    async def send_status(self, event):
	        status = event['status']
	        await self.send(text_data=json.dumps({'status': status}))

###### Добавим в файл settings.py наше приложение и daphne
	INSTALLED_APPS = [
	    'django.contrib.admin',
	    'django.contrib.auth',
	    'django.contrib.contenttypes',
	    'django.contrib.sessions',
	    'django.contrib.messages',
	    'django.contrib.staticfiles',
	    'server',
	    'control',
	    'daphne',
	]

###### Запустим сервер:
```bash 
daphne -p 8001 server.asgi:application 
```
<!-- ![[telegram-cloud-photo-size-2-5303313991357027957-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5303313991357027957-y.jpg)

###### Перейдем  в Postman и создадим запрос websocket, внизу выбираем 
	тип данных JSON
	url = ws://127.0.0.1:8001/ws/robot/
	в сообщении передаем {"command": "forward"}
<!-- ![[telegram-cloud-photo-size-2-5368778965214421767-y.jpg]] -->
![Image alt](https://github.com/kravtandr/ros_metod/raw/master/images/telegram-cloud-photo-size-2-5368778965214421767-y.jpg)

Если отправлять сообщения робот будет двигаться вперед

## Задания для самостоятельной работы:
	1) Реализовать полное управление роботом.
	2) Добавить вывод информации о текущих скоростях робота по осям.
	3) Реализовать отображение пройденной траектории в виде следа.
	
	4* Подключить пакет slam и реализовать навигацию в симмуляторе.


