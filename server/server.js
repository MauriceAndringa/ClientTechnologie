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

const rooms = [];

const findRoom = function(number){
    let targetRoom = {roomNumber: - 1};
    for(let i = 0; i < rooms.length; i++){
        if(rooms[i].roomNumber == number){
            targetRoom = rooms[i];
        }
    }
    return targetRoom;
}


//User connected to the game
io.sockets.on('connection', function(socket){
    console.log("User " + socket.id + " connection!");
    socket.nickname = "";

    //Creating room
    socket.on('create room', function(data){
        console.log("after send: create");
        let userName = data["username"];
        let roomNumber = data["room"];

        //Not all fields filled in
        if(roomNumber == "" || userName == ""){
            console.log("Please fill in all fields: create");
            socket.emit('create room', "Please fill in all fields");
        }
        //Incorrect room
        else if(findRoom(roomNumber).roomNumber != -1){
            console.log("Room already exists!: create");
            socket.emit('create room', "Room already exists!");
        }
        //Set nickname
        else{
            socket.nickname = userName;
            let newRoom = {roomNumber: roomNumber, users: [userName]};
            rooms.push(newRoom);
            console.log("Room " + roomNumber + " created!");
            socket.join(roomNumber);
            console.log("User " + userName + " connected to room " + roomNumber);
            socket.emit('start game', true);
            socket.emit('nickname', userName);
        }

    });

    //Joining rooms
    socket.on('join room', function(data){
        console.log("after send: join");
        let userName = data["username"];
        let roomNumber = data["room"];

        //Not all fields filled in
        if(roomNumber == "" || userName == ""){
            console.log("Please fill in all fields: join");
            socket.emit('join room', "Please fill in all fields");
        }
        //Incorrect room
        else if(findRoom(roomNumber).roomNumber == -1){
            console.log("Room does not exists!: join");
            socket.emit('join room', "Room does not exists!");
        }
        //Room is full
        else if(findRoom(roomNumber).users.length >= 2){
            console.log("Room is full")
            socket.emit('join room', "Room is full");
        }
        //Register new user
        else{
            //Set nickname
            socket.nickname = userName;
            socket.join(roomNumber);
            findRoom(roomNumber).users.push(userName);
            console.log("User " + userName + " connected to room " + roomNumber);
            socket.emit('start game', true);
            socket.emit('nickname', userName);
        }

    });





    //When a user presses the 'send' button
    //socket.on('message', function(inputText){
        //Emit the message to all the client in the room
        //io.sockets.emit('message', 'User ' + socket.id + ': ' + inputText);
    //});


});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(8080, () => {
    console.log("Spel gestart op port 8080");
});