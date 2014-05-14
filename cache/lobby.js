var hash = require('./hashes');
var lobby = new hash.HashTable();
var userControl = new hash.HashTable();
var userIDs = new hash.HashTable();
var ctrl = 0;
var counter = 0;
//Set socket id, for easy access of user data, of specific user(socket.id)
var setID = function(input){
	var room = input.room;
	var lobby = input.lobby;
	var user = input.username;
	var userID = input.userID;

	userIDs.add(userID, {username: user, lobby: lobby, room: room}, true);

	return true;
}	

var getCtrl = function(){
	ctrl++;
	return ctrl;
}

//Reset DC flag of user, newly joined or inproper DC... (updated page)
var resetDC = function(input){
	if(input.username != undefined) input.username = input.username.toLowerCase();
	if(input.lobby != undefined) input.lobby = input.lobby.toLowerCase();
	var admin = userControl.get(input.username+input.lobby);
	if(admin === null || admin === undefined){
		return "error";
	}
	var ctrl = admin.value.ctrl,
	user = admin.value.user,
	premium = admin.value.premium,
	lobby = admin.value.lobby;

	admin = admin.value.admin;

	userControl.add(input.username+input.lobby,  {user: user, 
		lobby: lobby, 
		admin: admin,
		premiun: premium,
		room: input.room, 
		dc: false, 
		ctrl: ctrl}, true);
}

//Set for DC, incase of proper or inproper(se above)
var setDC = function(input){
	if(input.username != undefined) input.username = input.username.toLowerCase();
	if(input.lobby != undefined) input.lobby = input.lobby.toLowerCase();
	var admin = userControl.get(input.username+input.lobby);
	if(admin === null || admin === undefined){
		return "error";
	}
	var ctrl = admin.value.ctrl,
	user = admin.value.user,
	premium = admin.value.premium,
	lobby = admin.value.lobby;
	admin = admin.value.admin;
	userControl.add(input.username+input.lobby,  {user: user,
		lobby: lobby, 
		admin: admin,
		premium: premium,
		room: input.room, 
		dc: true, 
		ctrl: ctrl}, true);
}

//Get data to see if user still DC, incase still true it was proper DC
var getStat = function(input){
	if(input.username != undefined) input.username = input.username.toLowerCase();
	if(input.lobby != undefined) input.lobby = input.lobby.toLowerCase();
	var bool = userControl.get(input.username+input.lobby);
	console.log("succes?" + bool);
	if(bool === undefined || bool === null){
		return "error";
	}else{
		console.log("dc: " + bool.value.dc);
		return bool.value.dc;
	}
}

//Get user data according to socketID
var getSpec = function(userID){
	var select = userIDs.get(userID);
	if(select !== null && select !== undefined){
		userIDs.remove(userID);
		return select.value;
	}

	return false;
}

//Check if user already exists or not
var checkUser = function(input){
	if(input.username != undefined) input.username = input.username.toLowerCase();
	if(input.lobby != undefined) input.lobby = input.lobby.toLowerCase();
	var check = userControl.get(input.username+input.lobby);
	if(check === null || check === undefined){
		return false;
	}else{
		return true;
	}
}

//Check if user is admin
var adminCheck = function(input){
	if(input.username != undefined) input.username = input.username.toLowerCase();
	if(input.lobby != undefined) input.lobby = input.lobby.toLowerCase();
	var admin = userControl.get(input.username+input.lobby);
	console.log("admin check" + admin);
	// Admin flag will be 1 if admin and 0 if not
	if(admin === null || admin === undefined){
		return false;
	}else{
		// Doesn't care right now let the one who called to identify flag(se above)
		console.log("value of admin is: " + admin.value.admin);
		return admin.value.admin;
	}
}

var makeAdmin= function(input){

	if(input.username != undefined) input.username = input.username.toLowerCase();
	if(input.lobby != undefined) input.lobby = input.lobby.toLowerCase();

	var admin = userControl.get(input.username + input.lobby);
	if(admin === null || admin === undefined){
		return "error";
	}else{
		// Doesn't care right now let the one who called to identify flag(se above)
		var room = admin.value.room,
		ctrl = admin.value.ctrl,
		dc = admin.value.dc,
		user = admin.value.user,
		premium = admin.value.premium,
		lobby = admin.value.lobby;
		userControl.add(input.username+input.lobby, 
				{user: user,
			lobby: lobby,
			admin: input.admin,
			premium: premium,
			room: room, 
			dc: dc, 
			ctrl: ctrl}, true);

		return input.admin;
	}
}

var ctrlCheck = function(input){
	var ctrl = userControl.get(input.username+input.lobby);
	if(ctrl === null || ctrl === undefined){
		return {error: "NONEXIST: user doesn't exist", code: "NONEXIST"};
	}else{
		ctrl = ctrl.value.ctrl;
		if(input.ctrl == ctrl){
			return true;
		}else{
			return false;
		}

	}
}

//Add user
var addUser = function(input){
	var users = lobby.get(input.lobby.toLowerCase());

	// Adding to lobby user list, for easy controll if user already exists or not, DC flas is ignored here
	var bool = userControl.add(input.username.toLowerCase()+input.lobby.toLowerCase(), 
			{user: input.username,
		lobby: input.lobby,
		admin: input.admin,
		premium: input.premium, 
		room: input.room, 
		dc: false, 
		ctrl: input.ctrl}, false);
	if(!bool)return bool;

	var rooms = null;
	var amount = 0, permanent, password, lobbyname;
	if(users === null || users === undefined){
		// Lobby doesn't exists so don't add the user
		bool = false;	
	}else if(input.room === null ){
		// Not trying to join room
		// Standard values
		users = users.value;
		lobbyname = users.lobby;
		rooms = users.rooms;
		amount = users.amount;
		password = users.password;
		permanent = users.permanent;
		users = users.users;

		// Add user
		bool = users.add(input.username.toLowerCase(), input.username, false);	
	}else{
		// Probably joining a room
		users = users.value;

		// Standard values
		lobbyname = users.lobby;
		rooms = users.rooms;
		amount = users.amount;
		permanent = users.permanent;
		password = users.password;
		users = users.users;

		// Add if room exist
		var room;
		if(rooms === null || rooms === undefined){
			// Error, room hashlist doens't exist should never happen
			bool = false;
		}else{
			room = rooms.get(input.room.toLowerCase());
			if(room === null || room === undefined){
				// Room doesn't exist can't add to the room
				bool = false;
			}else{
				// Room exists trying to add user if not already exists
				var roomn = room.value.room;
				room = room.value.users;
				bool = room.add(input.username.toLowerCase(),input.username, false);
				// Updating room userlist incase something wrong happends, could be unnecessary
				rooms.add(input.room.toLowerCase(), {room: roomn, users: room}, true);
			}
		}		
	}
	if(bool){
		// New user were successfully added so increase amount of users, this could be moved to usercontrol instead
		// would make everything easier
		amount++;
		lobby.add(input.lobby.toLowerCase(), 
				{lobby: lobbyname, 
			users: users, 
			rooms: rooms, 
			amount: amount, 
			password: password, 
			permanent: permanent}, true);
		counter++;
	}

	// Return true or false depending if successful
	return bool;
} 
var getUserCount = function(){
	return counter;
}

// Under progress, to show all users in all lobbies.
var getAllUsers = function(){
	var tupel = lobby.getKeyValuePairs();
	var string = "";
	for(var e = 0; e < tupel.length; e++){
		// Initiating html code to create a list for each lobbies.
		string += "<div>Lobby: " + tupel[e].value.lobby + "</div>";
		// Start every lobby list as closed
		var users = tupel[e].value.users;
		var amount = tupel[e].value.amount;
		var list = users.getKeyValuePairs();

		// Print out all users in lobby who's not in a specific room
		for(var i = 0; i < list.length; i++){
			string += "<div>User(NoRoom): " + list[i].value + "</div>";
		}
		// Get all rooms
		var rooms = tupel[e].value;
		rooms = rooms.rooms;
		console.log(rooms);

		// Safety net if lobby was not properly created
		if(rooms !== null && rooms !== undefined){
			// Get both roomname(key/hash) and hashlist of users
			rooms = rooms.getKeyValuePairs();

			// Safety net if rooms was not properly created when lobby was created
			if(rooms !== undefined && rooms !== null){
				// Initiating list for users could be made gobally later on
				var userlist;

				console.log("printing rooms");

				for(var i = 0; i < rooms.length; i++){
					// For each room create proper html code
					// and take the "key" which is room name
					userlist = rooms[i].value.users;
					name = rooms[i].value.room;

					for(var a = 0; a < list.length; a++){
						// Create proper html code for each users
						string += String.fromCharCode(12,15);
						string += "<div>User(Room): " + list[a].value + "</div>";
					}

				}
			}
		}
	}

	return string;
}
var getUsers = function(input){
	// Get users properly coded in html
	var tupel = lobby.get(input.lobby.toLowerCase());
	if(tupel === null){
		// Lobby doesn't exist...
		return "<li>lobby: " + input.lobby + " doesn't exist</li>";
	}

	// Initiating default values and get values.
	var string = "<ul id='__lobby'>";
	var users = tupel.value.users;
	var amount = tupel.value.amount;
	var list = users.getKeyValuePairs();

	// Print out all users in lobby who's not in a specific room
	for(var i = 0; i < list.length; i++){
		string += "<li id='_" + list[i].value + "' class='user no-room";
		var userinfo = userControl.get(list[i].value.toLowerCase()+input.lobby.toLowerCase()).value,
		admin = userinfo.admin,
		premium = userinfo.premium;
		if(admin == 1 || admin == 3)
			string += " admin";
		else if(admin == 2)
			string += " mod";
		else if(premium == 1)
			string += " premium";
		else
			string += " guest";
		string += "'>" + list[i].value + "</li>";
	}
	string += "</ul>";
	// Get all rooms
	var rooms = tupel.value;
	rooms = rooms.rooms;
	console.log(rooms);

	// Safety net if lobby was not properly created
	if(rooms !== null && rooms !== undefined){
		// Get both roomname(key/hash) and hashlist of users
		rooms = rooms.getKeyValuePairs();

		// Safety net if rooms was not properly created when lobby was created
		if(rooms !== undefined && rooms !== null){
			// Initiating list for users could be made gobally later on
			var userlist;

			console.log("printing rooms");

			for(var i = 0; i < rooms.length; i++){
				// For each room create proper html code
				// and take the "key" which is room name
				userlist = rooms[i].value.users;
				name = rooms[i].value.room;
				string += "<ul class='room' id='_room-"+
				name +
				"'>" + 
				"<div class='room-toggle";
				list = userlist.getKeyValuePairs();
				if(list.length > 0){
					string += " open";
				}else{
					string += " empty";
				}

				string += 
					"' id='toggle-" + 
					name +
					"' onclick='toggle($(\"#" + 
					name +
					"\"))'></div>" + 
					name + 
					"</ul><ul id='" +
					name +
					"'><span></span>";

				for(var a = 0; a < list.length; a++){
					// Create proper html code for each users
					string += "<li id='_" + list[a].value + "' class='user" 
					var userinfo = userControl.get(list[a].value.toLowerCase()+input.lobby.toLowerCase()).value,
					admin = userinfo.admin,
					premium = userinfo.premium;
					if(admin == 1 ||admin == 3)
						string += " admin";
					else if(admin == 2)
						string += " mod";
					else if(premium == 1)
						string += " premium";
					else
						string += " guest";
					string += "'>" + list[a].value + "</li>";
				}

				// End the ul properly
				string += "</ul>";
			}
		}
	}

	return string;
}

var checkRoom = function(input){

	// Check for if room already exists or not, true for occupied room does exist
	// false for available room does not exist already
	var lobb = input.lobby.toLowerCase();
	var exist = false;
	var room;
	if(input.room === null || input.room === 'null'){
		// room is null -> default room no real room which always should exist
		return true;
	}

	var rooms = lobby.get(lobb);

	if(rooms === null || rooms === undefined){
		// Lobby was not created properly room hashlist non existing
		// -> room can't exist
		return false;
	}else{
		// Lobby was properly created room hashlist exist
		// -> room may exist
		rooms = rooms.value.rooms;
		room = rooms.get(input.room.toLowerCase());
		if(room === undefined || room === null){
			return false;
		}else{
			return true;
		}

	}

}

var moveUser = function(input){
	// Try to move user from a room to an other
	// Initiating standard values and already known values
	var username = input.username;
	var lobbyname = input.lobby;
	var targetRoom = input.room;
	var room = userControl.get(username.toLowerCase() + lobbyname.toLowerCase());
	var admin = room.value.admin;
	room = room.value.room;
	console.log("admin?=" + admin);
	console.log("current room: " + room + " target room: " + targetRoom);

	if(targetRoom === "null"){
		// probably leaving a room and joining default room, incase change to proper value
		targetRoom = null;
	}

	if(room === 'null'){
		// Was in default room, inproper value -> change to proper value
		room === null;
	}

	// trying to remove user
	var bool = removeUser({lobby: lobbyname, room: room, username: username});
	console.log("success?: " + bool);

	// trying to add user to target room
	bool = addUser({lobby: lobbyname, room: targetRoom, username: username, admin: admin});
	console.log("success?: " + bool);

	// returning true or false depending if successful
	return bool;
}

var removeUser = function(input){
	// Trying to remove user
	if(input.lobby === undefined || input.username === null || input.username === "")return false;
	// Initiating standard and known values...
	var users = lobby.get(input.lobby.toLowerCase());
	var rooms;
	var amount = 0, permanent, password, lobbyname;

	// trying to remove from userControl first... if fail dont care
	var bool = userControl.remove(input.username.toLowerCase() + input.lobby.toLowerCase());

	console.log("remove the first: " + bool + " value of room = " + input.room);


	if(users === null || users === undefined){
		// Lobby doesn't exist can't remove user
		console.log("fail");
		bool = false;
	}else if(input.room === null || input.room === 'null'){
		// User is in default room
		console.log("no room");
		// Known values
		users = users.value;
		lobbyname = users.lobby;
		amount = users.amount;
		rooms = users.rooms;
		permanent = users.permanent;
		password = users.password;
		users = users.users;

		// Try to remove, response will be used later
		bool = users.remove(input.username.toLowerCase());
		console.log("succes when no room " + bool);
	}else{
		// User is in a specific room
		console.log("in a room -> " + input.room);
		// Known values
		rooms = users.value.rooms;
		lobbyname = users.lobby;
		amount = users.value.amount;
		permanent = users.value.permanent;
		password = users.value.password;
		users = users.value.users;

		var room = rooms.get(input.room.toLowerCase());
		if(room === null || room === undefined){
			// Room doesn't exist can't remove
			bool = false;
		}else{
			// Room exists, try to remove
			room = room.value.users;
			if(input.username === null){
				return false;
			}
			bool = room.remove(input.username.toLowerCase());
			console.log("success when room exist " + bool);
		}
	}

	if(bool){
		// In case of change, update amount value(may later be moved to user control
		amount--;
		lobby.add(input.lobby.toLowerCase(), 
				{lobby: lobbyname,
			users: users, 
			rooms: rooms, 
			amount: amount, 
			password: password, 
			permanent: permanent}, true);
		counter--;
	}
	return bool;
}

var checkLobby = function(input){
	// Check if lobby exist and in case return how many users already exists
	var check = lobby.get(input.lobby.toLowerCase());
	console.log("input was " + input.lobby.toLowerCase());
	if(check === null || check === undefined){
		return false;
	}else{
		check = check.value;
		return check.amount;
	}
}

var passwordCtrl= function(input){
	// Match the password, se if it match with lobby password
	var password = lobby.get(input.lobby.toLowerCase());
	if(password === null || password === undefined){
		// Lobby doesn't exist... password can't match
		return false;
	}else{
		// Lobby exists control it, if no password input password MUST have proper value don't need to check
		password = password.value.password;
		console.log(password + " ?= " + input.password + " = " + password === input.password);

		if(password == input.password){
			// Password is matching
			return true;
		}else{
			// Password missmatch
			return false;
		}
	}
}

var addLobby = function(input){
	// Try to add lobby

	// Initiate known values(password)
	var password = input.password;

	if(password === 'null'){
		// no password but inproper value change to proper
		password = null;
	}
	console.log("permanent?= " + input.permanent);

	// Try to add lobby if not already exist(or is a permanent one but would already exist if permanent)
	var bool = lobby.add(input.lobby.toLowerCase(), 
			{lobby: input.lobby, 
		users: new hash.HashTable(),
		rooms: new hash.HashTable(), 
		amount: 0, 
		password: password,
		permanent: input.permanent}, false);

	console.log("permanent?= " + lobby.get(input.lobby.toLowerCase()).value.permanent);
	return {bool: bool, lobby: lobby.get(input.lobby.toLowerCase()).value.lobby};
}

var removeLobby = function(input){
	// Try to remove lobby(last guy left)
	if(input.lobby === "" || input.lobby === null || input.lobby === undefined) return false;
	var check = lobby.get(input.lobby.toLowerCase());
	var bool = false;
	//console.log("lobby contains: " + check.value);
	if(check === null || check === undefined){
		// Lobby doesn't exists, can't remove non existing object
		bool = false;
	}else{
		// Lobby exists
		var amount = check.value.amount;
		//console.log("permanent? = " + lobby.get(input.lobby).value.permanent);
		// If permanent it should NEVER be deleted, or if there currently are users
		if(check.value.permanent){
			// PERMANENT lobby DON'T remove!
			console.log("permanent lobby dont remove");
			bool = false;
		}else if(amount <= 0){
			// NOT PERMANENT no users REMOVE THAT SHIT
			console.log("non permanent remove lobby");
			bool = lobby.remove(input.lobby.toLowerCase());
		}else{
			// NOT PERMANENT but users exists, DON'T remove
			//console.log("fail");
			bool = false;
		}
	}

	return bool;
}

var getLobbies = function(){
	var string = "";
	var lobbies = lobby.getKeyValuePairs();
	for(var i = 0; i < lobbies.length; i++){
		string += "<div>Lobby: " + lobbies[i].value.lobby + " Users: " + lobbies[i].value.amount + "</div>";
	}
	return string;
}

var addRoom = function(input){
	// Try to add room
	var rooms = lobby.get(input.lobby.toLowerCase());
	var bool = false;
	if(rooms === null || rooms === undefined){
		// Lobby doesn't exist, can't add room to non existing lobby
		bool = false;
	}else{
		// Lobby exist try to add
		rooms = rooms.value.rooms;
		bool = rooms.add(input.room.toLowerCase(),{room: input.room, users: new hash.HashTable()}, false);
		// False if room already exists
	}
	return bool;
}


var removeRoom = function(input){
	// Try to remove room
	var tuple = lobby.get(input.lobby.toLowerCase());
	var bool = false;
	if(tuple === null || tuple === undefined){
		// Lobby doesn't exist...
		bool = false;
	}else{
		// Lobby exists
		var rooms = tuple.value.rooms;
		var room = rooms.get(input.room.toLowerCase());
		if(room === null || room === undefined){
			// room doesn't exists...
			bool = false;
		}else{
			room = room.value.users;

			// Initiate known shit...
			var users = tuple.value.users;
			var rusers = room.getKeyValuePairs();

			bool = rooms.remove(input.room.toLowerCase());
			if(bool){
				// Room was deleted, move back users to default room, 
				// currently broken/not updated need to be fixed
				for(var i = 0; i < rusers.length; i++){
					users.add(rusers[i].key.toLowerCase(), rusers[i].value);
				}
			}
		}
	}
	return bool;
}

var getRoom = function(input){
	var room = userControl.get(input.user.toLowerCase() + input.lobby.toLowerCase());
	if(room == undefined || room == null){
		return false;
	}
	else{
		room = room.value.room;
		return room;
	}
}
//Export all the shit...
exports.getUsers = getUsers;
exports.removeUser = removeUser;
exports.addUser = addUser;
exports.checkUser = checkUser;
exports.getAllUsers = getAllUsers;
exports.getUserCount = getUserCount;
exports.addLobby = addLobby;
exports.removeLobby = removeLobby;
exports.getLobbies = getLobbies;
exports.addRoom = addRoom;
exports.removeRoom = removeRoom;
exports.getRoom = getRoom;
exports.passwordCtrl = passwordCtrl;
exports.checkLobby = checkLobby;
exports.adminCheck = adminCheck;
exports.makeAdmin = makeAdmin;
exports.moveUser = moveUser;
exports.getSpec = getSpec;
exports.setID = setID;
exports.checkRoom = checkRoom;
exports.resetDC = resetDC;
exports.setDC = setDC;
exports.getStat = getStat;
exports.getCtrl = getCtrl;
exports.ctrlCheck = ctrlCheck;