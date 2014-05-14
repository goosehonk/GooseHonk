var encrypt = function(password) {
	var encrypted = "", hash = 1, maxed = password.length * 2, over = maxed - 32, i;

	console.log(password);
	for (i = 0; i < password.length; i++) {
		encrypted += password[i];

		if (encrypted.length + over <= 33) {
			if(i+encrypted.length <= 127){
				encrypted += String.fromCharCode(i+encrypted.length);
			}
			else{
				encrypted += String.fromCharCode((i+encrypted.length - 126)+32);
			}
		}
	}

	for(i = 0; encrypted.length < 32; i++){
			if(i+encrypted.length <= 127){
				encrypted += String.fromCharCode(i+encrypted.length);
			}
			else{
				encrypted += String.fromCharCode((i+encrypted.length - 126)+32);
			}
	}

	if (password.length < 8) {
		hash = 9;
	} else if (password.length < 12) {
		hash = 7;
	} else if (password.length < 16) {
		hash = 5;
	} else {
		hash = 3;
	}

	console.log(hash);

	console.log(encrypted);
	console.log(encrypted.length);

	return change(encrypted, hash);
}

function change(salted, int){
	for(var i = 0; i < int*500; i++){
		salted = salted.replace(/./gi,function(e){
			e = e.charCodeAt(0);
			if(e+int <= 127){
				e+=int;
			}
			else{
				e = (e+int - 127) +33;
			}
			return String.fromCharCode(e);
		});
	}
	return salted;
}
exports.encrypt = encrypt;