var action = function(req, res, cache){
	// Checking if user is admin or not
	console.log("sending data");
	var lobby = req.body.lobby;
	var user = req.body.user;

	var bool = cache.adminCheck({lobby: lobby, username: user});
	if(bool == 2){
		res.end("2");
	}else if(bool == 1 || bool == 3){
		res.end("1");
	}else{
		res.end("0");
	}
}

exports.action = action;