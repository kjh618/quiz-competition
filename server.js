const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile('/public/index.html');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

let players = [];
let questions = require('./questions.json');

io.on('connection', socket => {
  socket.on('self connect', playerName => {
    let player = players.find(p => p.name === playerName);
    if (player !== undefined) {
      player.socketId = socket.id
    } else {
      let newPlayer = { name: playerName, socketId: socket.id, score: 0 };
      players.push(newPlayer);
    }
    io.emit('player connect', players);

    console.log(`${playerName} connected`);
  });

  socket.on('disconnect', () => {
    let player = players.find(player => player.socketId === socket.id);
    console.log(`${player.name} disconnected`);
  });

  socket.on('song request', (clientCallback) => {
    let songs = questions.map(q => q.question);
    clientCallback(songs);
  })
});
