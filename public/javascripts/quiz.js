const playerList = document.getElementById('playerList');

function updatePlayers() {
    fetch('/quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestType: 'updatePlayers' })
    }).then(response => {
        return response.json();
    }).then(players => {
        playerList.innerText = players.map(player => player.name + ': ' + player.score).join(', ');
    });
}

setInterval(updatePlayers, 1000);
