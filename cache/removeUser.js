var action = function(input, cache){
	// Removes user and then lobby if possible, if lobby is empty
	var lobby = input.lobby,
	room = input.room,
	username = input.username;
	if(lobby === undefined) return false;
	// If room is the string 'null' converte to proper type
	if(room === 'null'){
		input.room = null;
	}
	
	// Remove if exist...
	var bool = cache.removeUser(input);
	console.log("success removing user? " + bool);
	
	// Remove if empty...
	bool = cache.removeLobby(input);
	console.log("success removing lobby? " + bool);

}

exports.action = action;