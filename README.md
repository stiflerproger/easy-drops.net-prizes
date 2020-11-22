# Общее

Если на сайте есть "дыра" и о ней знают абузеры, то считаю всем нужно о ней знать, чтобы админы её пофиксили =)
p.s. я сам пробовал абузить эту тему, но хай банки залетают в последние 10секунд розыгрыша и шансов не оставляют.
p.s.s если админы сайта это читают, то сделайте хотябы розыгрыш в случайное время суток, чтобы шансы были у всех, а итоге подводите в конце дня =)

# Объяснение работы

На сайте все взаимодействия происходят методом "чата" по сокету. Если зайти на страницу с призами, то получаем сообщение с текущими предметами для розыгрыша, и ВНИМАНИЕ, дополнительно в сообщении указываются все открытия кейсов призов. т.е. в реальный момент времени мы можем видеть кто и сколько кейсов открыл, и кто является текущим лидером.

# Скрипт для консоли

Скрипт для консоли нужно просто вставить в консоль на странице призов. Через некотое время отобразится текущая информация о топах в призах.  

Я сделал два разных скрипта для консоли. Первый для случаев, если вы не хотите запускать сервер, а просто хотите узнать текущей количество открытий.
Второй для тех кто запустит сервер. Тут уже будет видно кто именно держит лидерство

Просто скопируйте код скрипта, и вставьте его в консоль на странице призов.
Скрипт (без сервера): [console-no-server.js](./console-no-server.js)
Скрипт (с сервером): [console-with-server.js](./console-with-server.js)

# Сервер для парсера профилей
- Зачем парсить профиля? 
- В сообщении сокета профили обозначены как уникальные ID, которые состоят из случайный символов длиной 17

Принцип работы сервера достаточно простой. Бот слушает сообщения live открытий, и собирает информацию о всех профилях. 
И запускается express сервер, который будет возвращить имеющуюся информацию

Сервер просто запустить на vds
Сервер:  [index.js](./index.js)
