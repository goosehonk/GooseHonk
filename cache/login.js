var connect = require('./connect'),
connection = connect.con();

var action = function(req, res, cache){
	console.log("@login>/action: trying to log in");
	var exists = false;
	
	// initiating standard values, all "names" should be in lowecase when getting here
	var lobby = req.body.lobby;
	var user = req.body.user;
	var password = req.body.password;
	var premium = req.body.premium;

	var globalpremium = false;
	var prem = 0;
	var mod = false, globaladmin = false;
	console.log("lobby " + lobby + " user " + user + " password " + password);
	// Default admin value
	var admin = false;
	connection.query("SELECT name,admin FROM user", function(err, result){
		if(err){
			res.end("error");
			throw err;
		}
		for(var i = 0; i < result.length; i++){
			if(result[i].name.toLowerCase() == user.toLowerCase() && result[i].name.toLowerCase() !== premium.toLowerCase()){
				exists = true;
				res.send("1");
				break;
			}else if(result[i].name.toLowerCase() == user.toLowerCase() && result[i].name.toLowerCase() === premium.toLowerCase()){
				console.log("premium found");
				
				globalpremium = true;
				mod = result[i].admin;
				prem = 1;
				break;
			}
		}
		if(!exists){
			// Try add lobby, returns false if already exists
			var bool = cache.addLobby({	lobby: lobby, password: password});
			var lobbyname = bool.lobby;
			bool = bool.bool;
			console.log("succes?" + bool);
			
			if(globalpremium){
				console.log("GlobalAdmin(1), mod(2) or regular(0): " + mod);
				admin = mod;
				if(admin > 0){
					globaladmin = true;
					if(admin == 1)
						admin = 3;
				}
			}
			
			// Control if lobby existed or not before above call
			if(admin != 3 && (cache.checkLobby({lobby: lobby}) <= 0 || bool)){
				// Lobby existed but was empty or it's a newly created lobby
				admin = 1;
			}
			
			
			if(!bool){
				// Lobby already existed and may have password
				/*
		if(password === 'null' || password === "" || password === null || password === 'NULL	'){
			password = null;
		}*/
				// Control password
				bool = cache.passwordCtrl({lobby: lobby, password: password});
			}
			console.log("succes?" + bool);
			if(bool || globaladmin){
				// Try to add user, if already exist false is returned
				ctrl = cache.getCtrl();
				bool = cache.addUser({lobby: lobby, room: null, username: user, userID: 0, admin: admin, premium: prem, ctrl: ctrl});
			}else{
				// wrong password
				res.send("2");
				return;
			}

			console.log("succes?" + bool);
			/*if(!bool){
				
				bool = cache.ctrlCheck({username: user, lobby: lobby, ctrl: req.body.ctrl});
				console.log("user already exists, ctrl match?=" + bool);
			}*/
			if(!bool){
				// Unsuccessful login
				res.send("0");
			}else if(bool){
				// Successful login
				res.send("3," + lobbyname);
			}else{
				res.send("4");
			}
		}
		console.log("done");
	});
}

exports.action = action;