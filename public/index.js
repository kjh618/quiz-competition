const socket = io();

const playerList = document.getElementById('playerList');
function updatePlayerList(players) {
  playerList.innerHTML = '';
  for (let player of players) {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(player.name + ': ' + player.score));
    playerList.appendChild(li);
  }
}


let playerName = prompt("Enter username: ");
socket.emit('self connect', playerName);
if (playerName === 'DJ') {
  for (let button of document.getElementsByClassName('controlPanelButton')) {
    button.disabled = false;
  }
}

socket.on('player connect', players => {
  updatePlayerList(players);
});

socket.emit('song request', songs => {
  let numLoaded = 0;
  function loaded() {
    numLoaded++;
    if (numLoaded == songs.length) {
      document.getElementById('loadingMessage').textContent = 'All songs loaded.'
    }
  }

  for (let song of songs) {
    let audio = new Audio(song);
    audio.addEventListener('canplaythrough', loaded, false);
  }
});
