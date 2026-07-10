const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let players = {};

io.on('connection', (socket) => {
  console.log('Игрок зашел:', socket.id);
  
  socket.on('move', (data) => {
    players[socket.id] = data;
    io.emit('update', players); // шлем всем позиции
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    io.emit('update', players);
  });
});

server.listen(3000, () => {
  console.log('Сервер запущен на порту 3000');
});content://com.android.externalstorage.documents/tree/primary%3Acity-multiplayer%20::primary:city-multiplayer /server.js