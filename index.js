/** Для красоты логов заменил дефолтный вывод */
const originalLog = console.log;
console.log = function log() {
  originalLog.apply(console, [`\x1b[32m${new Date().toLocaleString()}  \x1b[0m`, ...arguments])
}

const EasyDrop = require('./lib/easy-drop');
const easyDrop = new EasyDrop();

const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  if (!req.query.users) return res.send({users: []});

  console.log(req.query.users.split(','));

  const users = easyDrop.getUsers( req.query.users.split(',') );

  return res.send({users: users});
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
