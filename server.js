const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const quiz = require('./quiz.json');

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.render('index', { quiz });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

let players = []; // [{ name: ..., socketId: ..., score: ... }, ...]
let questions = quiz.map(q => q.question);
let currentQuestionIndex = -1;
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

  socket.on('play next click', () => {
    if (currentQuestionIndex !== -1) {
      questions.splice(currentQuestionIndex, 1);
    }

    currentQuestionIndex = Math.floor(Math.random() * questions.length);
    io.emit('play next', questions[currentQuestionIndex]);
  });

  socket.on('play again click', () => {
    if (currentQuestionIndex !== -1) {
      io.emit('play again', questions[currentQuestionIndex]);
    }
  });
});
