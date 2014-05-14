function getCookie(name) {
	var parts = document.cookie.split("&");
	for(var i=0; i<parts.length; i++) {
		var part = parts[i].split("=");
		if (part[0] == name) {
			return part[1];
		}
	}
	return null;
}

function eatCookie(name) {
	document.cookie = name + "=&expires=Thu, 01 Jan 1970 00:00:01 GMT&";
}

function updateCookie(data){
	// Update 1-4 tagged values at the same time

	var newData = [data.user, data.lobby, data.room, data.premium],
	tags = ["user", "lobby", "room", "premium"];
	var string = "";
	var parts = document.cookie;
	if(parts == ""){
		for(var i=0; i < 4; i++) {
			if(newData[i] == undefined){
				if(tags[i] != "premium")
					newData[i] = "null";
				else
					newData[i] = "";
			}
			string += tags[i] + "=" + newData[i];

			if(i < 3)
				string += "&";
		}
	}else{
		parts = parts.split("&");	

		for(var i=0; i < 4; i++) {
			var part = parts[i].split("=");
			if(i == 3 && newData[i] == "null"){
				string += part[0] + "=";
			}else if (part[0] == tags[i] && newData[i] != undefined){
				// tags value side was NOT undefined, which means update the value
				string += part[0] + "=" + newData[i];
			}else{
				// tags value side was undefined which means don't update
				string += part[0] + "=" + part[1];
			}
			if(i < 3)
				string += "&";
		}
	}
	document.cookie = string;
}