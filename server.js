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
const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log('Сервер запущен на порту', PORT);
    });
