
function initChat() {
	messages = [];
	socket = io.connect('http://178.79.145.111:8080');
	socket.emit('join', {username: getCookie("user"), lobby: getCookie("lobby"), room: getCookie("room")});
	socket.on('message', function (data) {
		if(data.message != "") {
			createDiv(data.message, data.username);
		}
	});
	
	socket.on('update', function(data) {		// Update the whole list.
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase())
			leave();
	});
	
	socket.on('add room', function(data) {		// Add new room.
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase())
			leave();
		addRoom(data.room);
	});
	
	socket.on('add user', function(data) {		// Add new user.
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase()){
			leave();
		}
		if(data.username != getCookie("user") && $('#_' + data.username).length < 1) {
			addUser(data.username, data.room);
		}
	});
	
	socket.on('move', function(data) {			// Move a user in the room list.
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase())
			leave();
		moveUser(data.user, data.to, data.from);
	});
	
	socket.on('delete', function(data) {	
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase())
			leave();
		deleteRoom(data.room);
		if(data.room.toLowerCase() == getCookie("room").toLowerCase()) {
			updateCookie({room: "null"});
			window.location.hash = "";
			socket.emit('move', {lobby: getCookie("lobby"), to: "null", from: data.room});
		}
	});
	
	socket.on('mod', function(data) {			// Update mod status.
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase())
			leave();
		if(data.user.toLowerCase() == getCookie("user").toLowerCase()) {
			$('#admin-span').html(" (mod)");
			$('.options-button.del').addClass("active");
			$('#new-room-wrapper').addClass("active");
		}
		$('#_' + data.user).removeClass("guest");
		$('#_' + data.user).removeClass("premium");
		$('#_' + data.user).addClass("mod");
		$('#mod-' + data.user).removeClass("mod");
		$('#mod-' + data.user).addClass("unmod");
		$('.user-tooltip#a-' + data.user).removeClass("guest");
		$('.user-tooltip#a-' + data.user).removeClass("premium");
		$('.user-tooltip#a-' + data.user).addClass("mod");
	});
	
	socket.on('unmod', function(data) {			// Update mod status.
		if(data.lobby.toLowerCase() != getCookie("lobby").toLowerCase())
			leave();
		if(data.user.toLowerCase() == getCookie("user").toLowerCase()) {
			$('#admin-span').html("");
			$('.options-button.del').removeClass("active");
			$('#new-room-wrapper').removeClass("active");
		}
		$('#_' + data.user).removeClass("mod");
		
		var premium = null;
		$.ajax({
			url         :   "php/premiumcheck.php",
			dataType    :   "html",/* JSON, HTML, SJONP... */
			type        :   "post", /* POST or GET; Default = GET */
			async		: 	false,
			data: {	
				user	:	 data.user,
				lobby	:	 getCookie("lobby")
			},
			success     :   function(response) { premium = parseInt(response) }
		});
		
		if(premium == 1)
			$('#_' + data.user).addClass("premium");
		else
			$('#_' + data.user).addClass("guest");
		
		$('#mod-' + data.user).removeClass("unmod");
		$('#mod-' + data.user).addClass("mod");
		$('.user-tooltip#a-' + data.user).removeClass("mod");
		if(premium == 1)
			$('.user-tooltip#a-' + data.user).addClass("premium");
		else
			$('.user-tooltip#a-' + data.user).addClass("guest");
	});
	
	socket.on('kick', function(data) {
		if(data.user.toLowerCase() == getCookie("user").toLowerCase()) {
			updateCookie({lobby: "null", room: "null"});
			leave();
		}
		else
			$('#_' + data.user).remove();
	});
}

function leave() {
	window.location.href = "/";
}

function addRoom(room) {
	var ul = document.createElement("ul");
	ul.className = "room";
	ul.id = "_room-" + room;
	var toggle = document.createElement("div");
	toggle.className = "room-toggle empty"; 
	toggle.id = "toggle-" + room;
	toggle.setAttribute("onclick", "toggle('" + room + "')");
	var list = document.createElement("ul");
	list.id = room;
	ul.appendChild(toggle);
	ul.appendChild(document.createTextNode(room));
	
	var options = document.createElement("div");
	options.className = "rooms options";
	
	var del = document.createElement("div");
	del.setAttribute("role", "button");
	del.className = "options-button del";
	if(admin == 1 || admin == 2) 
		del.className += " active";
	del.id = "del-" + room;
	del.appendChild(document.createElement("div"));
	options.appendChild(del);
	
	var leave = document.createElement("div");
	leave.setAttribute("role", "button");
	leave.setAttribute("title", "Leave");
	leave.className = "options-button leave";
	leave.id = "leave-" + room;
	leave.appendChild(document.createElement("div"));
	options.appendChild(leave);
	
	var join = document.createElement("div");
	join.setAttribute("role", "button");
	join.className = "options-button join active";
	join.id = "join-" + room;
	join.appendChild(document.createElement("div"));
	options.appendChild(join);
	
	$(options).appendTo(ul);
	
	document.getElementById('room-list').appendChild(ul);
	document.getElementById('room-list').appendChild(list);
}

function addUser(user, room) {
	var a = null;
	$.ajax({
		url         :   "php/admincheck.php",
		dataType    :   "html",/* JSON, HTML, SJONP... */
		type        :   "post", /* POST or GET; Default = GET */
		async		: 	false,
		data: {	
			user	:	 user,
			lobby	:	 getCookie("lobby")
		},
		success     :   function(response) { a = parseInt(response) }
   	});
	
	var p = null;
	$.ajax({
		url         :   "php/premiumcheck.php",
		dataType    :   "html",/* JSON, HTML, SJONP... */
		type        :   "post", /* POST or GET; Default = GET */
		async		: 	false,
		data: {	
			user	:	 user,
			lobby	:	 getCookie("lobby")
		},
		success     :   function(response) { p = parseInt(response) }
	});
	
	var li = document.createElement("li");
	li.id = "_" + user;
	li.className = "user no-room";
	if(a == 1)
		li.className += " admin";
	else if(a == 2)
		li.className += " mod";
	else if(p == 1)
		li.className += " premium";
	else
		li.className += " guest";

	li.innerHTML = user;
	
	var options = document.createElement("div");
	options.className = "users options";
	
	var kick = document.createElement("div");
	kick.setAttribute("role", "button");
	kick.setAttribute("title", "Kick");
	kick.className = "options-button kick";
	if(admin == 1 || admin == 2)
		kick.className += " active";
	kick.id = "kick-" + user;
	kick.appendChild(document.createElement("div"));
	options.appendChild(kick);
	
	var mod = document.createElement("div");
	mod.setAttribute("role", "button");
	mod.setAttribute("title", "Mod/unmod");
	mod.className = "options-button mod";
	if(admin == 1)
		mod.className += " active";
	mod.id = "mod-" + user;
	mod.appendChild(document.createElement("div"));
	options.appendChild(mod);
	
	$(options).appendTo(li);
	
	document.getElementById('__lobby').appendChild(li);
}

function moveUser(user, to, from) {
	if(to == null) {							// Move user to lobby.
		$('#_' + user).addClass("no-room");
		$('#_' + user).appendTo('#__lobby');
	}
	else {										// Move user to another room.
		$('#_' + user).removeClass("no-room");
		$('#_' + user).appendTo('ul#' + to);
		$('#toggle-' + to).removeClass("empty");
		if(user == getCookie("user") && $('ul#' + to).children().length > 2 && !$('#toggle-' + to).hasClass("open")) {
			toggle(to);							// If user joins a room that is closed but not empty, toggle it.
		}
		$('#toggle-' + to).addClass("open");
		$('#_room-' + to).addClass("active");
	}
	$('#_room-' + from).removeClass("active");
	if($('ul#' + from).children().length < 2) {	// If a room is left empty, close it.
		if(!$('#toggle-' + from).hasClass("open")) {	// If a room is closed when left empty, toggle it.
			toggle(from);
		}
		$('#toggle-' + from).removeClass("open");
		$('#toggle-' + from).addClass("empty");
	}
	if(user == getCookie("user")) {
		$('#leave-' + from).removeClass("active");
		$('#leave-' + to).addClass("active");
		$('#join-' + from).addClass("active");
		$('#join-' + to).removeClass("active");
		$('#leave' + from).removeClass("active");
		$('#leave' + to).addClass("active");
	}
}

function deleteRoom(room) {
	$('ul#' + room).children().addClass("no-room");
	$('ul#' + room).children().appendTo($('#__lobby'));
	$('ul#' + room).remove();
	$('#_room-' + room).remove();
}

function submit() {
	var message = $('#message').val();
	var user = getCookie("user"),
		lobby = getCookie("lobby"),
		room = getCookie("room");
	var parts = message.split(" ");
	var s = parts[1];
	if(message.charAt(0) == "/") {
		
		if(parts[0] == "/add") {
			//create room
			var res = null;
			$.ajax({
				url			:	"php/createroom.php",
				datatype	: 	"html",
				type		: 	"post",
				async		: 	false,
				data: {
					lobby	:	lobby,
					room	: 	s,
					user	:	user
				},
				success		:	function(response) { res = parseInt(response); }
			});
			
			if(res == 0) {			// User is not admin.
				createDiv("You don't have permission to do that.");
			}
			else if(res == 1) {		// Room already exists.
				createDiv("Room <span style='font-weight:600'>" + s + "</span> already exists.");
			}
			else if(res == 2) {		// Update room list with the new room.
				socket.emit('add room', {lobby: lobby, room: s});
				createDiv("Added room <span style='font-weight:600'>" + s + "</span>.");
			}
			else {
				createDiv("error");
			}
		}
		else if(parts[0] == "/join" && s != room) {
			//join room
			var res = null;
			$.ajax({
				url			:	"php/joinroom.php",
				datatype	: 	"html",
				type		: 	"post",
				async		: 	false,
				data: {
					lobby	:	lobby,
					room	: 	s,
					user	:	user
				},
				success		:	function(response) { res = parseInt(response); }
			});
			
			if(res == 0) {			// Couldn't join room
				createDiv("Couldn't join room <span style='font-weight:600'>" + s + "</span>.");
			}
			else if(res == 1) {		// Joined room
				socket.emit('move', {user: user, to: s, from: room, lobby: lobby});
				updateCookie({room: s});
				createDiv("Joined room <span style='font-weight:600'>" + s + "</span>.");
				window.location.hash = s;
			}
		}
		else if(parts[0] == "/leave") {
			//leave room
			var res = null;
			$.ajax({
				url			:	"php/joinroom.php",
				datatype	: 	"html",
				type		: 	"post",
				async		: 	false,
				data: {
					lobby	:	lobby,
					room	: 	"NULL",
					user	:	user
				},
				success		:	function(response) { res = parseInt(response); }
			});
			
			if(res == 1) {		// if res = ok
				moveUser(user, null, room);
				socket.emit('move', {user: user, to: null, from: room, lobby: lobby}); 
				updateCookie({room: "null"});
				createDiv("Left room <span style='font-weight:600'>" + room + "</span>.");
				window.location.hash = "";
			}
		}
		else if(parts[0] == "/delete") {
			//delete room
			var res = null;
			$.ajax({
				url			:	"php/deleteroom.php",
				datatype	: 	"html",
				type		: 	"post",
				async		: 	false,
				data: {
					lobby	:	lobby,
					room	: 	s,
					user	: 	user
				},
				success		:	function(response) { res = parseInt(response); }
			});
			
			if(res == 0) {
				createDiv("You don't have permission to do that.");
			}
			else if(res == 1) {
				createDiv("Couldn't delete room <span style='font-weight:600'>" + s + "</span>.");
			}
			else if(res == 2) {
				createDiv("Deleted room <span style='font-weight:600'>" + s + "</span>.");
				socket.emit('delete', {room: s, lobby: lobby} );
			}
		}
		else if(parts[0] == "/mod") {
			var res = null;
			$.ajax({
				url			: 	"php/mod.php",
				datatype	: 	"html",
				type		: 	"post",
				async 		: 	false,
				data: {
					user 	: 	user,
					mod 	: 	s,
					unmod	: 	null,
					lobby 	: 	lobby
				}, 
				success 	: 	function(response) { res = parseInt(response); }
			});
			
			if(res == 0) {
				createDiv("You don't have permission to do that.");
			}
			else if(res == 1) {
				createDiv("User " + s + " wasn't found.");
			}
			else if(res == 2) {
				createDiv("<span style='font-weight:600'>" + s + "</span> is now mod.");
				socket.emit('mod', {user: s, lobby: lobby});
			}
		}
		else if(parts[0] == "/unmod") {
			var res = null;
			$.ajax({
				url			: 	"php/mod.php",
				datatype	: 	"html",
				type		: 	"post",
				async 		: 	false,
				data: {
					user 	: 	user,
					mod 	: 	null,
					unmod	: 	s,
					lobby 	: 	lobby
				}, 
				success 	: 	function(response) { res = parseInt(response); }
			});
			
			if(res == 0) {
				createDiv("You don't have permission to do that.");
			}
			else if(res == 1) {
				createDiv("User <span style='font-weight:600'>" + s + "</span> wasn't found.");
			}
			else if(res == 2) {
				createDiv("<span style='font-weight:600'>" + s + "</span> is no longer mod.");
				socket.emit('unmod', {user: s, lobby: lobby});
			}
		}
		
	}
	else if(!/\S/.test(message)) {
		// Only whitespaces; don't send.
	}
	else if(message != "") {
		message = message.replace(/fuck|shit|cunt|slut|bitch|whore|jens|hora|fitta|fan|fyfan|kuk|jävlar/gi, function(e){
			var newmessage = "";
			for(var i = 0; i < e.length; i++){
				var add = String.fromCharCode(randomIntFromInterval(33,39));
				add = add.replace(/"/gi, "@");
				add = add.replace(/'/gi, "?");
				newmessage += add;
			}
			return newmessage;
		});
		socket.emit('send', { message: message, username: getCookie("user"), lobby: getCookie("lobby"), room: getCookie("room")});
		createDiv(message, getCookie("user"));
	}
	$('#message').val("");
}

function createDiv(text, user) {
	var chatWindow = document.getElementsByClassName('chat-window-content');
	var chatWindowMain = document.getElementsByClassName('chat-window-content-main');
	var chatMessage = document.createElement("div");
	chatMessage.className = "chat-message";

	var messageText = document.createElement("div")
	messageText.className = "message-text";
	var messageTime = document.createElement("div")
	messageTime.className = "message-time";
	
	var a = "";
	
	var admin = null;
	$.ajax({
		url         :   "php/admincheck.php",
		dataType    :   "html",/* JSON, HTML, SJONP... */
		type        :   "post", /* POST or GET; Default = GET */
		async		: 	false,
		data: {	
			user	:	 user,
			lobby	:	 getCookie("lobby")
		},
		success     :   function(response) { admin = parseInt(response) }
   	});
	
	var premium = null;
	$.ajax({
		url         :   "php/premiumcheck.php",
		dataType    :   "html",/* JSON, HTML, SJONP... */
		type        :   "post", /* POST or GET; Default = GET */
		async		: 	false,
		data: {	
			user	:	 user,
			lobby	:	 getCookie("lobby")
		},
		success     :   function(response) { premium = parseInt(response) }
   	});
	
	if(user != undefined) {
		a += "<a id='a-" + user + "' class='user-tooltip ";
		if(admin == 0 && premium == 0)
			a += "guest";
		else if(admin == 0 && premium == 1)
			a += "premium";
		else if(admin == 1)
			a += "admin";
		else if(admin == 2)
			a += "mod";
		a += "'>" + user + "</a><span style='font-weight: 600'>:</span> ";
		
		messageText.innerHTML = a;
		
		if(!tabFocus) {
			newMessages++;
			if(document.title.charAt(0) == "(")
				document.title = "(" + newMessages + ") " + document.title.split(") ")[1];
			else 
				document.title = "(" + newMessages + ") " + document.title;
			chatMessage.className += " unread";
		}

	}
	if(text.indexOf("http://") > -1) {
		var parts = text.split("http://");
		var rest = parts[1].substring(parts[1].split(" ")[0].length);
		messageText.innerHTML += "<span>" + parts[0] + "<a id='link' target=blank href='http://" + parts[1].split(" ")[0] +"'>http://" + parts[1].split(" ")[0] + "</a></span> ";
		if(rest != undefined) 
			 messageText.innerHTML += "<span>" + rest + "</span>";
	}
	if(text.indexOf("https://") > -1) {
		var parts = text.split("https://");
		var rest = parts[1].substring(parts[1].split(" ")[0].length);
		messageText.innerHTML += "<span>" + parts[0] + "<a id='link' target=blank href='https://" + parts[1].split(" ")[0] +"'>https://" + parts[1].split(" ")[0] + "</a></span> ";
		if(rest != undefined) 
			 messageText.innerHTML += "<span>" + rest + "</span>";
	}
	else if(text.indexOf("www.") > -1) {
		var parts = text.split("www.");
		var rest = parts[1].substring(parts[1].split(" ")[0].length);
		messageText.innerHTML += "<span>" + parts[0] + "<a id='link' target=blank href='http://www." + parts[1].split(" ")[0] +"'>www." + parts[1].split(" ")[0] + "</a></span> ";
		if(rest != undefined) 
			 messageText.innerHTML += "<span>" + rest + "</span>";
	}
	else {
		messageText.innerHTML += "<span>" + text + "</span>";
		
	}
	messageTime.innerHTML = "<span id='time'>[" + getTime() + "]</span>";
	
	chatMessage.appendChild(messageText);
	chatMessage.appendChild(messageTime);
	
	chatWindow[0].appendChild(chatMessage);
	
	$('.message-text').last()[0].style.maxWidth = "calc(100% - " + ($('.message-time').last().width() + 15) + "px)";
	$('.chat-message').last()[0].style.height = ($('.message-text').last().height() + 2) + "px";
	
	if(user == undefined) 
		$('.message-text').last()[0].style.left = "-20px";
	
	if(scrollBottom || user == getCookie("user")) {
		$(chat).stop().animate({ scrollTop: $(chatWindowMain)[0].scrollHeight }, 500, function() {
			$('html, body').unbind("scroll mousedown DOMMouseScroll mousewheel");	
		});
	}
}

function getTime() {
    var now = new Date();
    return (now.getHours() + ':' +
           (now.getMinutes() < 10 
		   ? ("0" + now.getMinutes())
           : (now.getMinutes())) + ':' 
		   + ((now.getSeconds() < 10)
           ? ("0" + now.getSeconds())
           : (now.getSeconds())));
}

function randomIntFromInterval(min,max)
{
	return Math.floor(Math.random()*(max-min+1)+min);
}
