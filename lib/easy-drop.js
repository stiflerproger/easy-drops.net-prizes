const WebSocket = require('ws');
const fs = require('fs');

class EasyDrop {

  ws; users = {}; usersQueue = []; saveTimeout = null;
  reloadTimeout; userParseTimeout; // костыльное решение перезагрузки парсера если по какой-то причине отвалился

  parseInterval = setInterval(() => {

    if (!this.usersQueue.length) return;

    console.log('Parse queue: ' + this.usersQueue.length);

    if (this.users[this.usersQueue[0]]) return;

    this.ws.send(JSON.stringify({ "msg": "sub", "id": makeid(17), "name": "user", "params": [this.usersQueue.shift()] }));

  }, 5000);

  constructor() {
    if (!fs.existsSync('_users.json')) this.save();

    this.load();

    this.connect();
  }

  connect() {
    console.log('Connecting..');
    this.ws = new WebSocket("wss://easy-drops.net/websocket");
    this.setEvents();
  }

  save() {

    fs.writeFileSync('_users.json', JSON.stringify(Object.values(this.users)));

    clearTimeout(this.saveTimeout);

    this.saveTimeout = null;

  }

  load() {
    const _users = JSON.parse(fs.readFileSync('_users.json', 'utf-8'));

    this.users = Object.fromEntries(_users.map(e => [e.id, e]));
  }

  getUsers(userIds) {
    if (!Array.isArray(userIds)) {
      return [];
    }

    for (let i = 0; i < userIds.length; i++) {
      let user = Object.values(this.users).find(e => e.hashId === userIds[i]);

      userIds[i] = user || null;
    }

    return userIds;
  }


  setEvents() {

    this.ws.on('open', () => {

      console.log('Openned');

      this.ws.send(JSON.stringify({
        msg: "connect",
        support: ["1", "pre2", "pre3"],
        version: "1"
      }));

    });

    this.ws.on('close', () => {
      console.error('Disconnected!');
      this.connect();
    });

    this.ws.on('message', (data) => {

      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error(e);
      }

      switch (data.msg) {

        case "connected":
          console.log('Connected');
          this.ws.send(JSON.stringify({ "msg": "sub", "id": makeid(17), "name": "live_drops", "params": [] }));
          break;

        case "ping":
          this.ws.send(JSON.stringify({ "msg": "pong" }));
          break;

        case "added":

          if (data.collection === 'live_drops') {

            if (!this.users[data.fields.user.id]) this.addUserToQueue(data.fields.user.id);

          } else if (data.collection === 'users') {

            if (!data.fields || !data.fields.services || !data.fields.services.steam) return;

            const user = {
              id: data.fields.id,
              hashId: data.id,
              username: data.fields.services.steam.username,
              avatar: data.fields.services.steam.avatar.full
            };

            this.users[data.fields.id] = user;

            console.log('User: ' + user.username);

            clearTimeout(this.userParseTimeout);

            this.userParseTimeout = setTimeout(() => {
              console.error('Юзеры не парсятся..реконнект');
              this.connect();
            }, 900000); //15 минут

            if (!this.saveTimeout) {
              this.saveTimeout = setTimeout(() => {
                this.save();
              }, 5000);
            }

          }

          break;

        default:
          break;
      }

    });

  }



  addUserToQueue(id) {
    if (!id) {
      return console.log('UserId need to be set');
    }

    clearTimeout(this.reloadTimeout);

    this.reloadTimeout = setTimeout(() => {
      console.error('Юзеры не поступают..реконнект');
      this.connect();
    }, 900000); //15 минут

    if (this.usersQueue.find(e => e === id)) return;

    this.usersQueue.push(id);

  }

}


module.exports = EasyDrop;

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
