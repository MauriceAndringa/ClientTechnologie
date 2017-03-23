var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app);

app.listen(8000);
console.log("listening on port 8000");

function handler ( req, res ) {
    res.writeHead( 200 );
    res.end('hello world');
    console.log("server online browser check...");
};

io.sockets.on('connection', function (socket) {
  console.log("user "+socket.id+" connected");
  socket.on('UserMessage', function (data) {
		console.log("message " + data + " received by " + socket.id);
    	socket.broadcast.emit('UserMessage', data);
  });
});