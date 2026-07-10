const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {};
let obstacles = []; // 1. ОБЩИЕ МАШИНЫ ДЛЯ ВСЕХ
let coins = []; // 2. ОБЩИЕ МОНЕТЫ ДЛЯ ВСЕХ
let raceFinished = false;
let winner = null;

// Генерим дорогу 1 раз для всех
function generateWorld() {
  obstacles = [];
  coins = [];
  for(let i = 0; i < 20; i++) {
    obstacles.push({ id: i, x: Math.random() * 600, y: i * -400 });
    if(i % 3 === 0) coins.push({ id: i, x: Math.random() * 600, y: i * -400 });
  }
}
generateWorld();

io.on('connection', (socket) => {
  console.log('Игрок зашел:', socket.id);

  // Отправляем новому игроку весь мир
  socket.emit('world', { obstacles, coins });

  socket.on('move', (data) => {
    // data = { x, y, distance, coins, crashed }
    players[socket.id] = data;

    // 3. ПРОВЕРКА ФИНИША
    if(!raceFinished && data.distance >= 10000) {
      raceFinished = true;
      winner = socket.id;
      io.emit('raceOver', { winner: socket.id, prize: 50 });
      console.log("Победитель:", socket.id);

      // Через 5 сек новая гонка
      setTimeout(() => {
        raceFinished = false;
        winner = null;
        for(let id in players) players[id].distance = 0;
        generateWorld();
        io.emit('newRace', { obstacles, coins });
      }, 5000);
    }

    io.emit('update', players); // шлем всем позиции
  });

  socket.on('collectCoin', (coinId) => {
    coins = coins.filter(c => c.id!== coinId); // Убираем монету для всех
    io.emit('coinCollected', coinId);
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('update', players);
  });
});

setInterval(() => {
  // Двигаем общие препятствия вниз
  obstacles.forEach(o => o.y += 5);
  coins.forEach(c => c.y += 5);
  // Если уехали за экран - спавним сверху заново
  if(obstacles[0].y > 800) generateWorld();

  io.emit('worldUpdate', { obstacles, coins });
}, 50);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Сервер запущен на порту', PORT);
});
