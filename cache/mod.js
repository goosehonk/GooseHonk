var action = function(req,res,cache){
	var lobby = req.body.lobby,
		user = req.body.user,
		mod = req.body.mod,
		unmod = req.body.unmod;
	
	console.log("user: " + user + " lobby: " + lobby);
	
	var flag = cache.adminCheck({lobby: lobby, username: user}),
		target;
	if(unmod)
		target = cache.adminCheck({lobby: lobby, username: unmod});
	else
		target = cache.adminCheck({lobby: lobby, username: mod});
	if((flag == 1 && target != 1) || (flag == 3 && target != 3)){
		if(unmod){
			flag = cache.makeAdmin({lobby: lobby, username: unmod, admin: 0});
			if(flag === "error"){
				res.end("1");
			}else{
				res.end("2");
			}
		}else{
			flag = cache.makeAdmin({lobby: lobby, username: mod, admin: 2});
			if(flag === "error"){
				res.end("1");
			}else{
				res.end("2");
			}
		}
	}else{
		res.end("0");
	}
}
exports.action = action;