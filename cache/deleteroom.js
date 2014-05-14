var action = function(req, res, cache){
	console.log("sending data");

	// All chars should be in lowercase when here
	var lobby = req.body.lobby;
	var room = req.body.room;
	var username = req.body.user;
	var bool = cache.adminCheck({lobby: lobby, username: username});
	// Try to remove room in specifik lobby
	console.log("admin is " + bool);
	if(bool == 1 || bool == 2){
		bool = cache.removeRoom({lobby: lobby, room: room});
		if(bool){
			res.end("2");
		}else{
			res.end("1");
		}
	}else{
		res.end("0");
	}
	
}

exports.action = action;