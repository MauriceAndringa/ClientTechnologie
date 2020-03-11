//Set up variables for dependencies
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

//Defines the path of the client files (including index.html)
const clientPath = __dirname + '/../client';


const app = express();
app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

io.on('connection', function(socket){
    console.log('A user connected');
    //Send message to a single client
    socket.emit('message', 'Hallo, je bent verbonden');

    //When the server receives a message from a client
    socket.on('message', (inputText) => {
        //Send message to ALL connected clients
        io.emit('message', inputText);
    })
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(8080, () => {
    console.log("Spel gestart op port 8080");
});