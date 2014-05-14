var connect = require('./connect'),
connection = connect.con();

var load = function(cache){
	var bool = false;
	connection.query('SELECT name,password FROM lobby', function(err, res1) {
		if(err)throw err;
		for(var i = 0; i < res1.length; i++){
			bool = cache.addLobby({lobby: res1[i].name, password: res1[i].password, permanent: true});
			//console.log("adding lobby: " + res1[i].name);
			//console.log("success? = " + bool);
		}
		
		connection.query('SELECT name,lobby FROM room', function(err, res2){
			if(err)throw err;
			for(var i = 0; i < res2.length; i++){
				bool = cache.addRoom({lobby: res2[i].lobby, room: res2[i].name});
				//console.log("adding room: " + res2[i].name + " to lobby: " + res2[i].lobby );
				//console.log("success? = " + bool);
			}
		});
	});
}

exports.load = load;