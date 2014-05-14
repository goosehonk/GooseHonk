var connect = require('./connect'),
connection = connect.con();

// action is our standard function name
var action = function(req, res, cache){
	
	// Always save and compare with lowercase chars
	// Here all chars should be in lowercase
	var lobby = req.body.lobby;
	//lobby = lobby.toLowerCase();
	
	var user = req.body.user;
	//user = user.toLowerCase();
	
	var prem = req.body.premium;
	
	console.log("username: " + user + " lobby: " + lobby + " premiumname: " + prem);
	
	// Initiatin standard..
	var bool, premium = false;
	
	// SQL query to take out all premium usernames
	connection.query("SELECT name FROM user", function(err, result){
		if(err){
			// An error occurd
			res.end("somethings wrong");
			throw err;
		}
		
		// compare username to premiums
		for(var i = 0; i < result.length; i++){
			if(result[i].name.toLowerCase() === user.toLowerCase() && result[i].name.toLowerCase() !== prem.toLowerCase()){
				// one matched were done
				premium = true;
				break;
			}
		}
		
		// Check if lobby exists
		bool = cache.checkLobby({lobby: lobby});
		console.log(lobby + ": "  + bool);

		if(bool === false && !premium){
			// Lobby is non-existing sending "three" as answere
			res.send("3");

		}else if(bool === false && premium){
			// Lobby is non-existing sending "two" as answere
			res.send("1");

		}else{		
			// Checking if user exists in lobby
			bool = cache.checkUser({lobby: lobby, username: user});
			if(bool || premium){
				// True, user exists or is premium name and lobby exists
				res.send("0");
			}
			else{
				// False, lobby exists but not the user
				res.send("2");
			}
		}
	});
}

exports.action = action;