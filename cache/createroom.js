var action =  function(req,res,cache){
	console.log("sending data");
	// All known values should be in lowerCase here
	var lobby = req.body.lobby;
	var user = req.body.user;
	var room = req.body.room;
	
	var exists= false;
	// Calling admin check to see if user is admin for this lobby
	var bool = cache.adminCheck({lobby: lobby, username: user});
	
	console.log("admincheck returned: "+ bool);
	if(bool == 2 || bool == 1){
		// user is admin in lobby so add room
		bool = cache.addRoom({lobby: lobby, room: room});
		if(bool){
			res.end("2");
		}else{
			res.end("1");
		}
	}else{
		// User is not admin, can't create new room
		res.end("0");
	}

}

exports.action = action;