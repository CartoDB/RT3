// Create WebSocket connection.
const socket = new WebSocket('ws://10.0.32.102:3333');

// Connection opened
socket.addEventListener('open', function (event) {
  socket.send('Hello Server!');
});

// Listen for messages
socket.addEventListener('message', function (event) {
  console.log('Message from server ', event.data);
});