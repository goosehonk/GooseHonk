var action = function(req, res, cache){
	lobby = req.body.lobby;
	// Retrieving all users from cache in proper version(in html)
	var data = cache.getUsers({lobby: lobby});
	
	// Controlling the html code
	console.log("data body is" + cache.getUsers({lobby: lobby}));
	
	// Sending html code to client
	res.send(data);
}

exports.action = action;