var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var active_connections = 0;
io.on('connection', function(socket) {
	console.log('a user connected!');
	io.emit('num users', active_connections++);

	socket.on('disconnect', function() {
		console.log('user disconnected');
		io.emit('num users', active_connections--);

	});

	socket.on('chat message', function(data) {
		console.log('Message: ' + data.name + '-' + data.msg);
		io.emit('chat message', data);
	});

	socket.on('typing', function(name) {
		socket.broadcast.emit('typing', name);
	});

	socket.on('done typing', function() {
		console.log('received done typing event');
		socket.broadcast.emit('done typing');
	});
});

http.listen(3000, function() {
	console.log('listening on 3000');
});