const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const quiz = require('./quiz.json');
const jailSeconds = 5;

app.set('views', './views');
app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.render('index', { quiz });
});


http.listen(3000, () => {
  console.log('listening on *:3000');
});


function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

let players = []; // [{ name: xyz, socketId: xyz, score: 0, inJail: false }, ...]
let shuffledQuiz = quiz.slice();
shuffle(shuffledQuiz);
let currentQuestionIndex = -1;
io.on('connection', socket => {
  socket.on('self connect', myName => {
    let player = players.find(p => p.name === myName);
    if (player !== undefined) {
      player.socketId = socket.id
    } else {
      let newPlayer = { name: myName, socketId: socket.id, score: 0, inJail: false };
      players.push(newPlayer);
    }

    io.emit('player list update', players);

    console.log(`${myName} connected`);
  });

  socket.on('disconnect', () => {
    let player = players.find(player => player.socketId === socket.id);
    console.log(`${player.name} disconnected`);
  });

  socket.on('play next click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < shuffledQuiz.length) {
      io.emit('play next', shuffledQuiz[currentQuestionIndex].question);
    }
    console.log('play next clicked');
  });

  socket.on('play again click', () => {
    if (currentQuestionIndex < 0 || currentQuestionIndex >= shuffledQuiz.length) {
      console.log('play again clicked but there is no current question');
    } else {
      io.emit('play again', shuffledQuiz[currentQuestionIndex].question);
      console.log('play again clicked');
    }
  });

  socket.on('quiz choice click', (choice, clientCallback) => {
    let player = players.find(player => player.socketId === socket.id);

    if (player.inJail) {
      console.log(`${player.name} chose ${choice} but is in jail`);
    } else {
      console.log(`${player.name} chose ${choice}`);
      if (choice === shuffledQuiz[currentQuestionIndex].answer) {
        player.score++;

        io.emit('disable choice', choice);
        clientCallback(true, jailSeconds);

        console.log('correct choice');
      } else {
        player.inJail = true;
        setTimeout(() => {
          player.inJail = false;
          io.emit('player list update', players);
          console.log(`${player.name} is now free`);
        }, jailSeconds * 1000);

        clientCallback(false, jailSeconds);

        console.log(`wrong choice; ${player.name} is now in jail`);
      }
    }

    io.emit('player list update', players);
  });
});
