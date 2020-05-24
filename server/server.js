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
            io.in(roomNumber).emit('get user', findRoom(roomNumber).users);
            io.in(roomNumber).emit('message', "Game: " + socket.nickname + " joined");
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
            io.in(roomNumber).emit('get user', findRoom(roomNumber).users);
            io.in(roomNumber).emit('message', "Game: " + socket.nickname + " joined");
            //socket.emit('message', "Game: " + socket.nickname + " joined");
        }
    });

    socket.on('userlist', function (data) {
        io.sockets.in(data).emit('userlist', findRoom(data).users);
    });

    socket.on('disconnect', function(){
        let roomNumber = "";
        for(let i = 0; i < rooms.length; i++){
            if(rooms[i].users.includes(socket.nickname)){
                roomNumber = rooms[i].roomNumber;
                let roomIndex = rooms[i].users.indexOf(socket.nickname);
                if (roomIndex >= 0){
                    rooms[i].users.splice(roomIndex, 1); //remove user from room
                    console.log("User " + socket.nickname + " has left room " + roomNumber);
                    socket.emit('get user', findRoom(roomNumber).users);
                    io.in(roomNumber).emit('message', "Game: " + socket.nickname + " left");
                    //socket.emit('message', "Game: " + socket.nickname + " left");
                }
                io.sockets.in(roomNumber).emit('userlist', findRoom(roomNumber).users);
                if (rooms[i].users.length == 0){
                    rooms.splice(i, 1) //if room is empty, delete room from rooms
                    console.log("Room " + roomNumber + "is empty, Room is deleted from list");
                }
            }
        }
        console.log("User " + socket.nickname + " left");
    });

    //When a user presses the 'send' button
    socket.on('message', function(inputText, room){
        //Emit the message to all the client in the room
        if(!(inputText == null)){
            io.to(room).emit('message', socket.nickname + ": " + inputText);
        }
    });
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(8080, () => {
    console.log("Spel gestart op port 8080");
});