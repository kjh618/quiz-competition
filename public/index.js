const socket = io();

const messages = document.getElementById('messages');
const form = document.getElementById('form');
const message = document.getElementById('message');

form.addEventListener('submit', event => {
    event.preventDefault();
    socket.emit('chat message', message.value);
    message.value = '';
});

socket.on('chat message', msg => {
    let li = document.createElement('li');
    li.appendChild(document.createTextNode(msg));
    messages.appendChild(li);
});