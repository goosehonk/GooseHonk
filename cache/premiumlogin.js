var connect = require('./connect'),
	connection = connect.con();

var action = function(req, res, cache){
	var name = req.body.user,
		password = req.body.password;
	
	connection.query("SELECT name,password FROM user", function(err, result){
		for(var i = 0; i < result.length; i++){
			if(result[i].name === name && result[i].password === password){
				res.write("1");
				break;
			}else if(i+1 === result.length){
				res.write("0");
			}
		}
		res.end();
	});	
}

exports.action = action;