var action = function(req, res, cache){
	var lobby = req.body.lobby,
	user = req.body.kick,
	admin = req.body.user,
	room;

	var adminControl = cache.adminCheck({lobby: lobby, username: admin}),
	targetControl = cache.adminCheck({lobby: lobby, username: user}),
	higher = false;

	if(targetControl == 3 ||
		(targetControl == 1 && adminControl == 2) || 
		(adminControl != 1 && adminControl != 2 && adminControl != 3) ||
		targetControl == adminControl || 
		!adminControl){
		res.end("0");
	}else{
		higher = true;
	}
	
	if(adminControl == 3 && targetControl != 3){
		higher = true;
	}
	
	if(higher){
		var exist = cache.getRoom({user: user, lobby: lobby});
		if(!exist){
			res.end("1");
		}
		// Remove if exist...
		var bool = cache.removeUser({lobby: lobby, username: user, room: exist});
		console.log("success removing user? " + bool);
		if(bool){
			res.end("2");
		}
		else{
			res.end("1");
		}
		
	}
	res.end("404");
}
exports.action = action;