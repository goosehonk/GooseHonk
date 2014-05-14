var connect = require('./connect'),
connection = connect.con();

var action = function(req, res, cache){

	var user = req.body.user,
	email = req.body.email,
	password = req.body.password;
	
	password = require('./encrypt').encrypt(password);
	
	connection.query("INSERT INTO user SET ?", {name: user, password: password, premium: 1, email: email},
			function(err, res2){
		if(err){
			if(err.code == "ER_DUP_ENTRY"){
				if(err.stack.indexOf("name_2") != -1){
					res.send("0");
				}else{ 
					res.send("1");
				}
			}else{
				res.end(err.code);
				console.log("unhandled error");
			}
		}
		res.end("2");

	});

}

exports.action = action;