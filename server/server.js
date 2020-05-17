//Set up variables for dependencies
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

//Defines the path of the client files (including index.html)
const clientPath = __dirname + '/../client';

var socketList = {};

const app = express();
app.use(express.static(clientPath));

const server = http.createServer(app);
const io = socketio(server);

io.sockets.on('connection', function(socket){
    if (socketList.length >= 2) {
        console.log('Room is full. Socket ' + socket.id + ' will be kicked');
        console.log('list length: ' + socketList.length);
        socket.emit('message', 'Room is full');
        socket.disconnect();
    } else {
        console.log('Socket ' + socket.id + ' connected!');
        console.log('list length: ' + socketList.length);
        socketList[socketList.length] = socket.id;
        //Send message to single client
        socket.emit('message', 'Successfully connected');
    }

    //When a user presses the 'send' button
    socket.on('message', function(inputText){
        //Emit the message to all the client in the room
        io.sockets.emit('message', 'User ' + socket.id + ': ' + inputText);
    });

    //Handle the disconnect of an user
    socket.on('disconnect', function(){
        console.log('Socket ' + socket.id + ' disconnected...');
        console.log('list length: ' + socketList.length);
        //Remove the user from the list of connected users
        for(var i = socketList.length - 1; i >= 0; i--){
            if(socketList[i] === socket.id){
                socketList.splice(i, 1);
            }
        }
    })
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(8080, () => {
    console.log("Spel gestart op port 8080");
});