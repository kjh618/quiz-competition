const socket = io();


let playerName = prompt("Enter username: ");
socket.emit('self connect', playerName);
if (playerName === 'DJ') {
  for (let button of document.getElementsByClassName('controlPanelButton')) {
    button.disabled = false;
  }
}

const playerList = document.getElementById('playerList');
function updatePlayerList(players) {
  playerList.innerHTML = '';
  for (let player of players) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(player.name + ': ' + player.score));
    playerList.appendChild(li);
  }
}

socket.on('player connect', players => {
  updatePlayerList(players);
});


function onPlayNextClick() {
  socket.emit('play next click');
}

function onPlayAgainClick() {
  socket.emit('play again click');
}

let audios = document.getElementsByTagName('audio');
let statusMessage = document.getElementById('statusMessage');

let numLoaded = 0;
function onAudioCanPlayThrough() {
  numLoaded++;
  if (numLoaded < audios.length) {
    statusMessage.textContent = `Loading... (${numLoaded}/${audios.length})`;
  } else {
    statusMessage.textContent = `Loaded (${numLoaded}/${audios.length})`;
  }
}

function playAudio(audioId) {
  for (let audio of audios) {
    audio.pause();
    audio.currentTime = 0;
  }
  document.getElementById(audioId).play();
  statusMessage.textContent = 'Playing';
}

function onAudioEnded() {
  statusMessage.textContent = 'Finished';
}

socket.on('play next', question => {
  playAudio('audioSrc' + question);
});

socket.on('play again', question => {
  playAudio('audioSrc' + question);
});
