const socket = io();

const playerList = document.getElementById('playerList');
function updatePlayerList(players, myName) {
  playerList.innerHTML = '';
  for (let player of players) {
    let playerInfo = `${player.name}: ${player.score}, ${player.inJail ? 'In Jail' : 'Free'}`;
    let text = document.createTextNode(playerInfo);
    let li = document.createElement('li');
    if (player.name == myName) {
      let strong = document.createElement('strong');
      strong.appendChild(text);
      li.appendChild(strong);
    } else {
      li.appendChild(text);
    }
    playerList.appendChild(li);
  }
}

socket.on('player list update', players => {
  updatePlayerList(players, myName);
});

const questionAudios = document.getElementsByClassName('questionAudio');
const loadingMessage = document.getElementById('loadingMessage');

let numLoaded = 0;
function onAudioCanPlayThrough(id) {
  numLoaded++;

  if (numLoaded < questionAudios.length) {
    loadingMessage.textContent = `Loading... (${numLoaded}/${questionAudios.length})`;
  } else {
    loadingMessage.textContent = `Loaded (${numLoaded}/${questionAudios.length})`;
  }

  console.log(id + ' loaded');
}


/* Player Connection */

const myName = prompt("Enter username: ");
socket.emit('self connect', myName);
if (myName === 'DJ') {
  for (let button of document.getElementsByClassName('controlPanelButton')) {
    button.disabled = false;
  }
}

/* Control Panel */

function onPlayNextClick() {
  socket.emit('play next click');
}

function onPlayAgainClick() {
  socket.emit('play again click');
}

const playingIndicator = document.getElementById('playingIndicator');

function playAudio(audioId) {
  for (let audio of questionAudios) {
    audio.pause();
    audio.currentTime = 0;
  }
  document.getElementById(audioId).play();
  playingIndicator .textContent = 'Playing';
}

socket.on('play next', question => {
  playAudio('audioSrc' + question);
});

socket.on('play again', question => {
  playAudio('audioSrc' + question);
});

function onAudioEnded() {
  playingIndicator.textContent = 'Finished';
}


/* Quiz Content */

function onQuizChoiceClick(choice) {
  socket.emit('quiz choice click', choice, (isCorrect, jailSeconds) => {
    if (isCorrect) {
      alert('Correct!');
    } else {
      alert(`Wrong! You're now in jail for ${jailSeconds} seconds.`);
    }
  });
}

socket.on('disable choice', choice => {
  let choiceItem = document.getElementById('choice' + choice);
  choiceItem.onclick = null;
  choiceItem.style.backgroundColor = 'gray';
});
