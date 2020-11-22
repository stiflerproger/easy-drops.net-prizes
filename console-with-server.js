// Использую var, вместо const, чтобы можно было повторно вводить код без перезагрузки страницы

/** Просто "прокси" сервер для cors запросов. С https на http. Не обязателен, если ваш сервер будет https */
var proxyurl = "https://cors-anywhere.herokuapp.com/";

/** Укажите здесь свой url сервера */
var PROFILE_SERVER_URL = proxyurl + 'http://111.111.111.111:3000';

/** Подключаемся к сокету */
var ws = new WebSocket("wss://easy-drops.net/websocket");

/** Разположение в этом массиве должно быть таким же как и расположение призов на сайте */
var prizes = ["milspec", "restricted", "classified", "covert"];

/** После подключения к сокету посылаем сообщение connect, так просит сервер изика */
ws.onopen = function () {
  ws.send(JSON.stringify({ msg: "connect", support: ["1", "pre2", "pre3"], version: "1" }));
};

/** Слушаем сообщения сокета */
ws.onmessage = function (event) {

  const data = JSON.parse(event.data);

  /** После успешного подключения к серверу подключаемся к странице с призами */
  if (data.msg === "connected") {
    ws.send(JSON.stringify({ msg: "sub", id: "6YYzT45WatXecAqAx", name: "prizes", params: [] }));
    return;
  }

  /** Тут интересующее нас сообщение с текущим состоянием призов */
  if (data.collection === "prizes" && data.msg === "added") {
    /** Сохраняем текущих топов в переменную */
    const tops = [];

    for (let i = 0; i < prizes.length; i++) {

      const topUser = Object.keys(data.fields[prizes[i]].users).reduce(
        (res, cur) => data.fields[prizes[i]].users[cur].counter >= res.counter ? Object.assign(data.fields[prizes[i]].users[cur], { id: cur }) : res,
        { counter: 0 }
      );

      tops.push(topUser);

    }

    /** Инициируем запрос получения профилей */
    getUsers(tops);

    /** Закрываем сокет */
    ws.close();
  }

};

/** Функция запроса профилей */
function getUsers(tops) {

  const url = PROFILE_SERVER_URL + "/?users=" + tops.map(e => e.id).join(',');

  /** Делаем запрос */
  fetch(url)
    .then(response => response.text())
    .then(data => {

      try {
        data = JSON.parse(data);
      } catch (e) {
        return console.error(e);
      }

      /** Добавляем визуализацию на страницу */
      for (let i = 0; i < tops.length; i++) {

        const user = data.users.find(e => e && e.hashId === tops[i].id);

        const aStyle = `
          position: absolute;
          left: 7px;
          top: 32px;
          display: flex;
          align-items: center;
          padding: 5px;
          background-color: #3347ccd4;
          border-radius: 5px;
          border: 1px solid #21cdde;
        `;

        const imgStyle = `
          width: 30px;
          margin-right: 10px;
          border-radius: 50%;
        `;

        $($(".layout-prizes__prize-item")[i])
          .find(".item-incase__price")
          .before(
            `
          <div class="item-incase__price"style="margin-right: 15px; border: 1px solid #21cdde; background-color: #3347ccd4;">
            ${tops[i].counter} кейсов
            ${user
              ? `<a href="/user/${user.id}" style="${aStyle}"><img src="${user.avatar}" style="${imgStyle}">${user.username}</a>`
              : `<a href="#" style="${aStyle}">Неизвестный</a>`
            }
          </div>
          `
          );

      }

    })
    .catch((e) => {
      console.log('Во время запроса возникла ошибка. Попробуйте позже!');
      console.error(e);
    })

}

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
