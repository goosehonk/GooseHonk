
function submit() {
	var user = document.getElementById('user');
	var lobby = document.getElementById('lobby');
	var password = document.getElementById('password');
	var tooltip = "#error.error-tooltip";
	var tooltipContent = "#error > .error-tooltip-content";
	var error = "#error";
	var offset = -$('#form').offset().top - 4;
	var ok = true;
	var length = true;
	
	if(user.value.length < 3 || user.value.length > 10) {
		offset += $(user).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Username must be between 3 and 10 characters");
		user.focus();
		length = false;
	}
	else if(lobby.value.length < 2 || lobby.value.length > 10) {
		offset += $(lobby).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Lobby name must be between 2 and 10 characters");
		lobby.focus();
		length = false;
	}
	else if(password.value.length > 20) {
		offset += $(password).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Password must be 20 characters or less");
		password.focus();
		length = false;
	}
	if(lobby.value.length >= 2 && lobby.value.length <= 10 && lobby.value.match(/[^A-Za-z0-9\-_]/)){
			offset += $(lobby).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Lobby contains illegal characters");
			ok = false;
		}
		if(user.value.length >= 3 && user.value.length <= 10 && user.value.match(/[^A-Za-z0-9\-_]/)){
			offset = -$('#form').offset().top - 4;
			offset += $(user).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Username contains illegal characters");
			ok = false;
		}
	else if(ok && length) {
		if(length)
			$(tooltip).removeClass("active");
		
		var res = null;
		$.ajax({
			url         :   "php/login.php",
			dataType    :   "html",/* JSON, HTML, SJONP... */
			type        :   "post", /* POST or GET; Default = GET */
			async		: 	false,
			data: { 
				user	:   user.value,
				lobby	:	lobby.value,
				password:	password.value, 
				premium : 	getCookie("premium")
			},
			success     :   
				function(response) {
					res = parseInt(response.split(",")[0]);
					dest = response.split(",")[1];
				}
		});
		
		if(res == 0) {
			offset += $(user).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("<span>\"</span>" + user.value + "<span>\"</span> is already being used in <span>\"</span>" 
									+ lobby.value + "<span>\"</span>." + "<br><br>Please pick a different name or another lobby");
			user.focus();
		}
		else if(res == 1) {
			offset += $(user).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("User is already taken by a premium user");
			user.focus();
		}
		else if(res == 2) {
			offset += $(password).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Wrong password");
			password.focus();
		}
		else if(res == 3) {
			updateCookie({user: user.value, lobby: dest, room: "null"});
			window.location.href = "/" + dest;
		}
		else {
			$(error).css({"top": "5px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Could not establish a connection to the server. Please try again in a few seconds.");
		}
	}
}

function loginSubmit() {
	var user = document.getElementById('login-user');
	var password = document.getElementById('login-password');
	var tooltip = "#login-error.error-tooltip";
	var tooltipContent = "#login-error > .error-tooltip-content";
	var error = "#login-error";
	var offset = -$('#form').offset().top - 4;
	if(user.value.length < 3 || user.value.length > 10) {
		offset += $(user).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Username must be between 3 and 10 characters");
		user.focus();
	}
	else if(password.value.length < 6 || password.value.length > 20) {
		offset += $(password).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Password must be between 6 and 20 characters");
		password.focus();
	}
	else {
		$(tooltip).removeClass("active");
		
		var res = null;
		$.ajax({
			url         :   "php/userlogin.php",
			dataType    :   "html",/* JSON, HTML, SJONP... */
			type        :   "post", /* POST or GET; Default = GET */
			async		: 	false,
			data: { 
				user	:   user.value,
				password:	password.value
			},
			success     :   
				function(response) {
					res = parseInt(response);
				}
		});
		
		if(res == 0) {
			offset += $(user).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Incorrect username or password");
			user.focus();
		}
		else if(res == 1) {
			updateCookie({user: user.value, lobby: "null", room: "null", premium: user.value});
			window.location.href = "/";
		}
		else {
			$(error).css({"top": "11px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Could not establish a connection to the server. Please try again in a few seconds.");
		}
	}
}

function registerSubmit() {
	var user = document.getElementById('register-user');
	var password = document.getElementById('register-password');
	var password2 = document.getElementById('register-password2');
	var email = document.getElementById('register-email');
	var tooltip = "#register-error.error-tooltip";
	var tooltipContent = "#register-error > .error-tooltip-content";
	var error = "#register-error";
	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    var validEmail = pattern.test(email.value);
	var offset = -$('#form').offset().top - 10;
	if(user.value.length < 3 || user.value.length > 10) {
		offset += $(user).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Username must be between 3 and 10 characters");
		$(user).focus();
	}
	else if(!validEmail) {
		offset += $(email).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Please enter a valid e-mail address");
		$(email).focus();
	}
	else if(password.value.length < 6 || password.value.length > 20) {
		offset += $(password).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Password must be between 6 and 20 characters");
		$(password).focus();
	}
	else if(password2.value == "") {
		offset += $(password2).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Enter password again");
		$(password2).focus();
	}
	else if(password.value != password2.value) {
		offset += $(password2).offset().top;
		$(error).css({"top": offset + "px" });
		$(tooltip).addClass("active");
		$(tooltipContent).html("Passwords don't match");
		$(password2).focus();
	}
	else {
		$(tooltip).removeClass("active");
		
		var res = null;
		$.ajax({
			url         :   "php/register.php",
			dataType    :   "html",/* JSON, HTML, SJONP... */
			type        :   "post", /* POST or GET; Default = GET */
			async		: 	false,
			data: { 
				user	:   user.value,
				password:	password.value,
				email	: 	email.value
			},
			success     :   
				function(response) {
					res = parseInt(response);
				}
		});
		
		if(res == 0) {
			offset += $(user).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Username is taken");
		}
		else if(res == 1) {
			offset += $(email).offset().top;
			$(error).css({"top": offset + "px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("E-mail is already in use");
		}
		else if(res == 2) {
			updateCookie({user: user.value, lobby: "null", room: "null", premium: user.value});
			window.location.href = "/";
		}
		else {
			$(error).css({"top": "11px" });
			$(tooltip).addClass("active");
			$(tooltipContent).html("Could not establish a connection to the server. Please try again in a few seconds.");
		}
	}
}