var action = function(req,res,cache){
	// All chars should be in lowercase
	// Initiating all known values
	var room = req.body.room;
	var lobby = req.body.lobby;
	var user = req.body.user;
	var exists = false;
	
	// Check for if room exists or not
	var bool = cache.checkRoom({lobby: lobby, room: room});
	console.log("room exists = " + bool);
	
	// Depending on which room, "null" is the default room
	if(room !== "null" && bool){
		// Probably /join was called, and target room exists
		// try to move user to new room
		bool = cache.moveUser({lobby: lobby, room: room, username: user});
		
		if(bool){
			// Moving user was succeful
			res.end("1");
			console.log("success");
		}
		else{
			// Moving user failed...
			console.log("fail");
			res.end("0");
		}
	}else if(room === "null"){
		// Target is defaultroom old room was probably deleted or user used /leave
		// try to move
		bool = cache.moveUser({lobby: lobby, room: room, username: user});

		if(bool){
			res.end("1");
			console.log("success");
		}
		else{
			console.log("fail");
			res.end("0");
		}
	}else{
		// error, somethings wrong
		res.end("error");
	}


}

exports.action = action;