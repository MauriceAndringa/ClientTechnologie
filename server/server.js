//copyright: Maurice Andringa (s1082583) en Kevin Geubels (s1090780)

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
    socket.nickname = "";
    io.sockets.emit('get room', rooms);

    //Creating room
    socket.on('create room', function(data){
        let userName = data["username"];
        let roomNumber = data["room"];

        //Not all fields filled in
        if(roomNumber == "" || userName == ""){
            socket.emit('errorMessageCreate', "Vul alle velden in!");
            socket.emit('create room', "Vul alle velden in!");
        }
        //Incorrect room
        else if(findRoom(roomNumber).roomNumber != -1){
            socket.emit('errorMessageCreate', "Kamer bestaat al!");
            socket.emit('create room', "Kamer bestaat al!");
        }
        //Set nickname
        else{
            socket.nickname = userName;
            let newRoom = {roomNumber: roomNumber, users: [userName], choices: []};
            rooms.push(newRoom);
            io.sockets.emit('get room', rooms);
            socket.join(roomNumber);
            socket.emit('show game', true, findRoom(roomNumber).users);
            socket.emit('nickname', userName);
            io.sockets.in(roomNumber).emit('get user', findRoom(roomNumber).users);
            io.sockets.in(roomNumber).emit('message', '<b>Game: </b>' + socket.nickname + " joined");
        }
    });

    //Joining rooms
    socket.on('join room', function(data){
        let userName = data["username"];
        let roomNumber = data["room"];

        //Not all fields filled in
        if(roomNumber == "" || userName == ""){
            socket.emit('errorMessageJoin', "Vul alle velden in!");
            socket.emit('join room', "Vul alle velden in!");
        }
        //Incorrect room
        else if(findRoom(roomNumber).roomNumber == -1){
            socket.emit('errorMessageJoin', "Kamer bestaat niet!");
            socket.emit('join room', "Kamer bestaat niet!");
        }
        //Room is full
        else if(findRoom(roomNumber).users.length >= 2){
            socket.emit('errorMessageJoin', "Kamer is vol!");
            socket.emit('join room', "Kamer is vol!");
        }
        //Register new user
        else{
            //Set nickname
            socket.nickname = userName;
            socket.join(roomNumber);
            findRoom(roomNumber).users.push(userName);
            io.sockets.emit('get room', rooms);
            socket.emit('show game', true, findRoom(roomNumber).users);
            socket.emit('nickname', userName);
            io.sockets.in(roomNumber).emit('get user', findRoom(roomNumber).users);
            io.sockets.in(roomNumber).emit('message', '<b>Game: </b>' + socket.nickname + " joined");
        }
    });

    socket.on('user list', function (room) {
        io.sockets.in(room).emit('user list', findRoom(room).users);
    });

    //Leaving rooms
    socket.on('disconnect', function(){
        let roomNumber = "";
        for(let i = 0; i < rooms.length; i++){
            if(rooms[i].users.includes(socket.nickname)){
                roomNumber = rooms[i].roomNumber;
                let roomIndex = rooms[i].users.indexOf(socket.nickname);
                if (roomIndex >= 0){
                    rooms[i].users.splice(roomIndex, 1); //remove user from room
                    io.in(roomNumber).emit('get user', findRoom(roomNumber).users);
                    io.sockets.in(roomNumber).emit('message', '<b>Game: </b>'  + socket.nickname + " left");
                }
                io.sockets.in(roomNumber).emit('user list', findRoom(roomNumber).users);
                if (rooms[i].users.length == 0){
                    rooms.splice(i, 1) //if room is empty, delete room from rooms
                }
                io.sockets.emit('get room', rooms);
            }
        }
    });

    //Sending chat messages to all users in room
    socket.on('global message', function(text, room){
        io.sockets.in(room).emit('message', text);
    });

    //Sending chat messages to all users except sender
    socket.on('broadcast message', function(text, room){
        socket.broadcast.to(room).emit('message', text);
    });

    //Sending chat messages to itself
    socket.on('self message', function(text){
        socket.emit('message', text);
    });

    //Rock, Paper, Scissor
    socket.on('player choice', function(room, userName, choiceMade){
        //Add choices to room
        findRoom(room).choices.push([userName, choiceMade]);
        //Check if both players made decision
        if(findRoom(room).choices.length == 2){
            switch (findRoom(room).choices[0][1].toString()) {
                case 'steen':
                    switch (findRoom(room).choices[1][1]) {
                        case 'steen':
                            io.sockets.in(room).emit('tie', findRoom(room).choices);
                            break;
                        case 'papier':
                            io.sockets.in(room).emit('player 2 win', findRoom(room).choices);
                            break;
                        case 'schaar':
                            io.sockets.in(room).emit('player 1 win', findRoom(room).choices);
                            break;
                        default:
                            break;
                    }
                    break;
                case 'papier':
                    switch (findRoom(room).choices[1][1].toString())
                    {
                        case 'steen':
                            io.sockets.in(room).emit('player 1 win', findRoom(room).choices);
                            break;

                        case 'papier':
                            io.sockets.in(room).emit('tie', findRoom(room).choices);
                            break;

                        case 'schaar':
                            io.sockets.in(room).emit('player 2 win', findRoom(room).choices);
                            break;

                        default:
                            break;
                    }
                    break;

                case 'schaar':
                    switch (findRoom(room).choices[1][1].toString())
                    {
                        case 'steen':
                            io.sockets.in(room).emit('player 2 win', findRoom(room).choices);
                            break;

                        case 'papier':
                            io.sockets.in(room).emit('player 1 win', findRoom(room).choices);
                            break;

                        case 'schaar':
                            io.sockets.in(room).emit('tie', findRoom(room).choices);
                            break;

                        default:
                            break;
                    }
                    break;

                default:
                    break;
            }
            findRoom(room).choices = [];
        }
    });
});

server.on('error', (err) => {
    console.error('Server error: ', err);
});

server.listen(8080, () => {
    console.log("Spel gestart op port 8080");
});