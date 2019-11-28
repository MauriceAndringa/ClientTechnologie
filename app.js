var express = require('express')
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

server.listen(process.env.PORT || 4);
console.log('Server running on port 4..');

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use(express.static("client"));


var rooms = [];

var findRoom = function (number) {
    var targetroom = {roomno: -1};
    for(var i = 0; i < rooms.length; i++){
        if (rooms[i].roomno == number){
            targetroom = rooms[i];
        }
    }
    return targetroom;
}

io.sockets.on('connection', function(socket){
    console.log("User " + socket.id + " connected!");
    socket.nickname = "";

    // Joining rooms
    socket.on('new user', function(data){
        var $username = data['username'];
        var $roomno = data['room'];

        if ($roomno == "" || $username == ""){

            socket.emit('new user', "Please fill in all fields!");
        }
        else if(findRoom($roomno).roomno == -1){
            socket.emit('new user', "Room does not exist!");
        }
        else {
            // Set nickname
            socket.nickname = $username;

            socket.join($roomno);

            findRoom($roomno).users.push($username);

            console.log("User " + $username + " connected to room " + $roomno + "!");

            socket.emit('new user', true);
            socket.emit('nickname', $username);
        }
    });
    // Creating rooms
    socket.on('new room', function (data) {
        var $username = data['username'];
        var $roomno = data['room'];

        if ($roomno == "" || $username == ""){
            socket.emit('new room', "Please fill in all fields!");
        }
        else if(findRoom($roomno).roomno != -1){
            socket.emit('new room', "Room already exists!");
        }
        else {
            // Set nickname
            socket.nickname = $username;

            // Create new room and add it to the array
            var newroom = {roomno: $roomno, users: [$username]};
            rooms.push(newroom);

            console.log("Room " + $roomno + " created!");

            socket.join($roomno);
            console.log("User " + $username + " connected to room " + $roomno + "!");

            socket.emit('new room', true);
            socket.emit('nickname', $username);
        }
    });

    // Get users
    socket.on('get users', function (data) {
        io.sockets.in(data).emit('get users', findRoom(data).users);
    });



    socket.on('start', function (data) {
        io.sockets.in(data.room).emit('new user story', data.msg);
        io.emit('getresults', findRoom(data.room).users);
    });

    socket.on('selected card', function(data){
        console.log(data.id + " " + data.name);
        var name = data.name;
        var id = data.id;

        io.sockets.emit("cards", {name: name, id :id})
    });


    socket.on('disconnect', function () {
        var roomno = "";
        for (var i = 0; i < rooms.length; i++){
            if(rooms[i].users.includes(socket.nickname)){
                roomno = rooms[i].roomno;
                var index = rooms[i].users.indexOf(socket.nickname);
                if (index >= 0){
                    rooms[i].users.splice(index, 1); // Remove user
                    console.log("User " + socket.nickname + " Left room " + roomno + "!");
                }
                io.sockets.in(roomno).emit('get users', findRoom(roomno).users);
                if (rooms[i].users.length == 0){
                    rooms.splice(i, 1); // If room has no users, delete room
                    console.log("Room " + roomno + " Deleted (Everybody left)");
                }
            }
        }
        console.log("User " + socket.id + " disconnected! (" + socket.nickname + ")");
    });

    socket.on('card value', function (data) {
        var name = data.name;
        var id = data.id;

        //noinspection JSAnnotator
        io.sockets.emit('new value', {id : id, name :name})
    });

    socket.on('reset user story', function (data) {
        io.sockets.in(data).emit('reset user story');
        io.to(socket.id).emit('reset-user-story-host');

    })

    function message () {
        io.emit('message', cards);
    }

    /* SEND AL VALUES  */

    socket.on('get all', function () {
        io.sockets.emit('send all');

    })

});

