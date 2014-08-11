var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;

app.use(express.static(__dirname + '/frontend'));
app.set('view engine', 'jade');
app.locals.pretty = true;


/* Express Routing */
app.get('/', function(req, res) {
	res.render('index.jade');
});

app.get('/jade', function(req, res) {
	res.render('index.jade');
});

/* Helpers for chat server */

var users = (function () {
	var names = [];

	var addName = function(name) {
		while(names.indexOf(name) != -1) {
			name = name + '_';
		}
		names.push(name);

		return name;
	};

	var getNames = function() {
		return names;
	};

	var removeName = function(name) {
		var i = names.indexOf(name);
		delete names[i];
	};

	return {
		add: addName,
		get: getNames,
		remove: removeName
	};
}());

var sockets = (function() {
	var _sockets = {};

	var updateName = function(socket, name) {
		_sockets[socket] = name;
	};

	var deleteName = function(socket) {
		delete _sockets[socket];
	};

	var getName = function(socket) {
		return _sockets[socket];
	};

	return {
		update: updateName,
		remove: deleteName,
		get: getName
	};
}());

var active_connections = 0;


io.on('connection', function(socket) {
	console.log('a user connected!');
	
	socket.emit('init', {
		names: users.get()
	});

	socket.on('change:name', function(name) {
		var givenName = users.add(name);
		io.emit('users:update', {
			names: users.get()
		});

		socket.emit('change:name', givenName);

		sockets.update(socket, name);
	});

	socket.on('send:message', function(data) {
		io.emit('send:message', data);
	});

	socket.on('disconnect', function() {
		var nameToRemove = sockets.get(socket);
		users.remove(nameToRemove);
		sockets.remove(socket);

		var name = "Admin";
		var body = nameToRemove + " has left the room...";

		io.emit('users:update', {
			names: users.get()
		});

		io.emit('send:message', {
			name: name,
			body: body
		});
	});


});

http.listen(port, function() {
	console.log('listening on ' + port);
});