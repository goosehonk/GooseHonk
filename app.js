
/**
 * Module dependencies.
 */

var express = require('express')
, app = express()
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path')
, mysql = require('mysql')
, port = 8080
, cache = require('./cache/lobby')
, fs = require('fs');
//all environments
app.set('port', process.env.PORT || 80);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(app.router);
app.use(express.static(__dirname + '/public'));

require('./cache/load').load(cache);
var io = require('socket.io').listen(app.listen(port));
console.log("Socket.io listening on port " + port);
var dc;
//development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

//Standard route
app.get('/', function(req , res){
	// empty "/" should be routed to login.html
	fs.createReadStream('./public/login.html').pipe(res);
	//res.sendfile('./public/login.html');
	//res.redirect('/lobby');
});

//routing to lobby
app.get('/lobby' , function(req , res){
	fs.createReadStream('./public/lobby.html').pipe(res);
	//res.sendfile('./public/lobby.html');

});

app.get('/php/connect.php', function(req, res){
	res.end("nope");
});

app.get('/:path' , function(req , res){
	if(req.params.path.indexOf("?") == -1)
		fs.createReadStream('./public/lobby.html').pipe(res);
	else
		fs.createReadStream('./public/login.html').pipe(res);
	//res.sendfile('./public/lobby.html');

});

//Routing to queries
app.post('/cache/:action' , function(req , res){
	console.log("@POST/cache> " + req.params.action);
	console.log(req.body);

	require('./cache/' + req.params.action).action(req, res, cache);
});

app.post('/php/:action' , function(req , res){
	console.log("@POST/php> converting to javascript...");
	console.log(req.body);

	var file = req.params.action.replace(".php","");
	require('./cache/' + file).action(req, res, cache);
});

//Chattsever genom socket.io
function censor(data){
	data.message = data.message.replace(/fuck/gi, '@$#!');
	data.message = data.message.replace(/shit/gi, '?%&@');
	data.message = data.message.replace(/cunt/gi, '@$%#');
	data.message = data.message.replace(/bitch/gi, '@$%#!');
	data.message = data.message.replace(/slut/gi, '@$%!');
	data.message = data.message.replace(/hora/gi, '@$%#!');
	return data;
}

io.sockets.on('connection', function (socket) { 

	socket.on('send', function (data) { 
		// Broadcasting received message to all in same chatroom
		console.log("sending to " + data.lobby + data.room);
		//data = censor(data);

		if(data.message.indexOf("./com") == 0){
			var admin = cache.adminCheck(data);
			if(admin == 3){
				if(data.message == "./com showlist"){
					var string = cache.getAllUsers();
					socket.emit('message', {message: '<span style="font-weight:600">SystemMessage: </span>' + string});
				}else if(data.message == "./com counter"){
					var i = cache.getUserCount();
					socket.emit('message', {message: '<span style="font-weight:600">SystemMessage: </span>' + i});
				}else if(data.message == "./com lobbies"){
					var string = cache.getLobbies();
					socket.emit('message', {message: '<span style="font-weight:600">SystemMessage: </span>' + string});
				}else if(data.message == "./com resetwarning"){
					socket.broadcast.emit('message',{message: "<span style='ont-weight:600'>SystemMessage: </span> Server will shortly restart for update"});
				}else if(data.message == "./com help" || data.message == "./com ?"){
					socket.emit('message', {message: "<span style='ont-weight:600'>SystemMessage:</span>" + " help..." + 
											"<div>./com showlist - to show all online users</div>" +
											"<div>./com counter - to show how many users online</div>" +
											"<div>./com lobbies - to show all existing lobbies</div>"});
				}else{
					socket.emit('message', {message: "<span style='ont-weight:600'>SystemMessage:</span>" + 
										" Was not a valid command, type ./com help or ./com ? for commands"});
				}
			}else{
				socket.emit('message', {message: "<span style='ont-weight:600'>SystemMessage: </span> you're not allowed to do that"});
			}

		}else{
			socket.broadcast.to(data.lobby + "&" + data.room).emit('message', {message: data.message, username: data.username});
		}
	});

	socket.on('join', function(data){ 
		// joining chattroom, lobbyname+room name, incase lobby = something and no room
		// chattroom equals somethingnull

		// Check if it was a short dc
		var bool = cache.getStat(data);
		if(bool){
			// Yes, welcome the user back
			socket.emit('message', {message: 'Welcome back! <span style="font-weight:600">' + data.username + '</span>' });
		}else{
			// No, it's a new user welcome him/her
			socket.emit('message', {message: 'Welcome <span style="font-weight:600">' + data.username + '</span>' });
			if(data.username != null){
				socket.broadcast.to(data.lobby).emit('message',
						{message: "<span style='font-weight:600'>" + 
					data.username + "</span> has joined the lobby"});
			}
		}

		// Reset DC flag for user -> connected
		cache.resetDC(data);

		// Joining chattroom
		socket.join(data.lobby + "&" + data.room);
		//console.log(socket.id + "joined" + data.lobby + data.room);

		// joining lobbyroom, socketroom where (force)updates will be prompted
		socket.join(data.lobby);

		// console.log("emitting to lobby: " + data.lobby + " userID -> " + socket.id );
		// Saving ID, and userdata into temp memory for easy access
		cache.setID({userID: socket.id, lobby: data.lobby, room: data.room, username: data.username, connected: true});

		// prompting everyone in the lobby to add user
		socket.broadcast.to(data.lobby).emit('add user',{username: data.username, lobby: data.lobby, room: data.room});
	});

	socket.on('disconnect', function(){
		// Checking for who disconnected
		var data = cache.getSpec(socket.id);
		var extra = cache.checkUser({lobby: data.lobby, username: data.username});
		console.log("User " + socket.id + " disconnected, removing if not premium and not update")
		// removing userdata from temp memory

		// Initiating DC flag
		cache.setDC(data);

		if(data !== undefined && extra){
			// Controlling if user is an existing user or not
			// setTimeout gives user 1s too reconnected
			setTimeout(function(){
				// Extra control
				if(data !== undefined){
					// Checking if user reconnected or not
					if(cache.getStat(data)){
						// User disconnected
						require('./cache/removeUser').action(data, cache);
						//console.log("disconnected: "+ socket.id);
						//console.log("removed user: " + data.username + " in room: " + data.room + " in lobby: " + data.lobby);
						socket.broadcast.to(data.lobby).emit('update');
						// Notifying users in lobby
						if(data.username != null){
							socket.broadcast.to(data.lobby).emit('message',
									{message: "<span style='font-weight:600'>" + 
								data.username + "</span> has left the lobby"});
							socket.broadcast.to(data.lobby).emit('kick', {user: data.username});
						}
						console.log("user disconnected");
					}else{
						// User reconnected, probably pressed update
						console.log("disconnected user reconnected");
					}
				}
			}, 10000);
		}else if(!extra){
			if(data.username != null){
				socket.broadcast.to(data.lobby).emit('message',
						{message: "<span style='font-weight:600'>" + 
					data.username + "</span> has left the lobby"});
				socket.broadcast.to(data.lobby).emit('kick', {user: data.username});
			}
		}
	});

	socket.on('switchRoom', function(data){
		//switching chattroom
		if(data.lobby !== undefined && data.lobby !== null)data.lobby = data.lobby.toLowerCase();
		if(data.oldRoom !== undefined && data.oldRoom !== null)data.oldRoom = data.oldRoom.toLowerCase();
		if(data.newRoom !== undefined && data.newRoom !== null)data.newRoom = data.newRoom.toLowerCase();
		if(data.username !== undefined && data.username !== null)data.username = data.username.toLowerCase();

		socket.leave(data.lobby + "&" + data.oldRoom);
		console.log(socket.id + "left" + data.lobby + data.oldRoom);

		socket.join(data.lobby + "&" + data.newRoom);
		console.log(socket.id + "joined" + data.lobby + data.newRoom);

		cache.setID({lobby: data.lobby, room: data.newRoom, username: data.username, userID: socket.id})

		// Wait 0.1s before prompting clients to update in same lobby
		setTimeout(function(){
			socket.broadcast.to(data.lobby).emit('update');
		}, 100);
	});

	socket.on('forceUpdate', function(data){
		console.log("forceupdate")
		if(data.lobby !== undefined)data.lobby = data.lobby.toLowerCase();	
		// Forcing client to update screen, someone switched room, joined lobby or something, and wait 100ms
		// to match the query delay
		setTimeout(function(){
			socket.broadcast.to(data.lobby).emit('update');
		}, 100);

	});

	socket.on('logout', function(){
		// Proper logout
		console.log("logout")

		var data = cache.getSpec(socket.id);
		socket.leave(data.lobby + data.room);
		socket.leave(data.lobby);

		if(data !== undefined){
			// User logged out
			require('./cache/removeUser').action(data, cache);
			//console.log("disconnected: "+ socket.id);
			//console.log("removed user: " + data.username + " in room: " + data.room + " in lobby: " + data.lobby)
			console.log("logged out user removed")
		}
		socket.disconnect()
		setTimeout(function(){
			socket.broadcast.to(data.lobby).emit('update');

			// Notifying users in lobby
			socket.broadcast.to(data.lobby).emit('message',
					{message: "<span style='font-weight:600'>" + 
				data.username + "</span> has left the lobby"});
		}, 100);

	});

	socket.on('add room', function(data) {
		socket.broadcast.to(data.lobby).emit('add room', data);
		socket.emit('add room', data);
	});

	socket.on('add user', function(data) {
		socket.broadcast.to(data.lobby).emit('add user', data);
		socket.emit('add user', data);
	});

	socket.on('delete', function(data) {
		socket.broadcast.to(data.lobby).emit('delete', data);
		socket.emit('delete', data);
	});

	socket.on('move', function(data){
		var lobby = data.lobby,
		from = data.from,
		to = data.to,
		user = data.user;

		console.log("move data: " + data);

		socket.leave(lobby + "&" + from);
		console.log(socket.id + "left" + data.lobby + data.oldRoom);

		socket.join(lobby + "&" + to);
		console.log(socket.id + "joined" + data.lobby + data.newRoom);

		cache.setID({lobby: data.lobby, room: to, username: user, userID: socket.id})

		socket.broadcast.to(data.lobby).emit('move',data);
		socket.emit('move', data);
	});

	socket.on('mod', function(data) {
		socket.broadcast.to(data.lobby).emit('mod', data);
		socket.emit('mod', data);
	});

	socket.on('unmod', function(data) {
		socket.broadcast.to(data.lobby).emit('unmod', data);
		socket.emit('unmod', data);
	});

	socket.on('kick', function(data) {
		socket.broadcast.to(data.lobby).emit('kick', data);
		socket.emit('kick', data);
	});

});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
