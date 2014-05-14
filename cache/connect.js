var mysql      = require('mysql');
var connection = mysql.createConnection({
	host : '127.0.0.1',
	user : 'root',
	password : 'kistan1pub2',
});

var con = function(){
	return connection;
}

connection.query('USE goosehonk', function (err) {
	if (err) {
		if(err.code == "ETIMEDOUT")
			console.log("Error: " + err.code + " occurd");
		
		throw err;
	}
});



exports.con = con;
