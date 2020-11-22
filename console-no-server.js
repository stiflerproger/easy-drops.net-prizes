// Использую var, вместо const, чтобы можно было повторно вводить код без перезагрузки страницы

/** Подключаемся к сокету */
var ws = new WebSocket("wss://easy-drops.net/websocket");

/** Разположение в этом массиве должно быть таким же как и расположение призов на сайте */
var prizes = ['milspec', 'restricted', 'classified', 'covert'];

/** После подключения к сокету посылаем сообщение connect, так просит сервер изика */
ws.onopen = function () {
  ws.send(JSON.stringify({ msg: "connect", support: ["1", "pre2", "pre3"], version: "1" }))
};

/** Слушаем сообщения сокета */
ws.onmessage = function (event) {

  const data = JSON.parse(event.data);

  /** После успешного подключения к серверу подключаемся к странице с призами */
  if (data.msg === 'connected') {
    ws.send(JSON.stringify({ "msg": "sub", "id": makeid(17), "name": "prizes", "params": [] }));
    return;
  }

  /** Тут интересующее нас сообщение с текущим состоянием призов */
  if (data.collection === 'prizes' && data.msg === 'added') {

    for (let i = 0; i < prizes.length; i++) {
      /** Добавляем визуализацию на страницу */
      $($('.layout-prizes__prize-item')[i]).find('.item-incase__price').before(
        `<div class="item-incase__price"style="margin-right: 15px; border: 1px solid #21cdde; background-color: #3347ccd4;">${Object.values(data.fields[prizes[i]].users).reduce((res, cur) => Math.max(res, cur.counter), 0)
        } кейсов</div>`
      );
    }

    /** Закрываем сокет */
    ws.close();
  }

};

/** Простая генерация случайного id */
function makeid(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
