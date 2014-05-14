var connect = require('./connect'),
connection = connect.con();

var action = function(req, res, cache){
	var user = req.body.user;
	var exist = false;
	connection.query('SELECT name FROM user', function(err, result){
		if(err){
			res.end("error");
			throw err;
		}
		for(var i = 0; i < result.length; i++){
			if(result[i].name != undefined && user != undefined){
				if(result[i].name.toLowerCase() === user.toLowerCase()){
					res.end("1");
					exist = true;
					break;
				}
			}
		}
		if(!exist){
			res.end("0");
		}
	});
}

exports.action = action;