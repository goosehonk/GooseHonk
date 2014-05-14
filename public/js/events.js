
$(function() {
	
	$('a#start').mousedown(function() {
		$('.start').addClass("active");
		$('.about').removeClass("active");
		$('.top').removeClass("open");
		$('a#about').removeClass("active");
		$('a#start').addClass("active");
	});
	
	$('a#chat').mousedown(function() {
		$('.chat').addClass("active");
		$('.about').removeClass("active");
		$('.top').removeClass("open");
		$('a#about').removeClass("active");
		$('a#chat').addClass("active");
	});
	
	$('a#about').mousedown(function() {
		$('.chat').removeClass("active");
		$('.start').removeClass("active");
		$('.about').addClass("active");
		$('.top').removeClass("open");
		$('a#chat').removeClass("active");
		$('a#start').removeClass("active");
		$('a#about').addClass("active");
	});
	
	$('#tooltip').hover(function (e) {
		ToolTip.open() //hover over
	}, function () {
		$('#tooltip').removeClass("active");
	});
	
	$('.chat-window-content-main').on("mouseover", '.user-tooltip', function() {
		var relativeY = $('.chat-window-content-frame').offset().top + $('.chat-window-content-frame').height() - 52 - $(this).offset().top;
		var tooltip = $('#tooltip');
		var width = tooltip.width() + 5;
		tooltip.css({"left": (-width) + "px", "bottom": (relativeY) + "px" });
		$('#tooltip-user').html($(this).text());
		
		if($(this).hasClass("admin"))
			$('#tooltip-user').addClass("admin");
		else if($(this).hasClass("mod"))
			$('#tooltip-user').addClass("mod");
		else if($(this).hasClass("premium"))
			$('#tooltip-user').addClass("premium");
		else if($(this).hasClass("guest"))
			$('#tooltip-user').addClass("guest");
			
		ToolTip.open() //hover over
	});
	$('.chat-window-content-main').on("mouseout", '.user-tooltip', function() {
		ToolTip.close() //hover out
	});
	
	ToolTip = {
		interval: null,
		timer: 500,
		open: function () {
			clearTimeout(ToolTip.interval);
			$('#tooltip').addClass("active");
		},
		close: function () {
			ToolTip.interval = setTimeout(function () {
				$('#tooltip').removeClass("active");
			}, ToolTip.timer) //hover out
		}
	}

	/*$('.settings-button').click(function() {
		if($('#settings').hasClass("active")) {
			$('.settings-button').removeClass("active");
			$('#settings').removeClass("active");
		}
		else {
			$('.settings-button').addClass("active");
			$('#settings').addClass("active");
		}
	});*/
	
	$('.user-details').click(function() {
		//$('.top').toggleClass("open");
	});
	
	$('#mic-checkbox').change(function() {
		if(this.checked) {
			micVolume = $('#mic-slider').val();
			$('#mic-slider').val("0");
			webrtc.mute();
		}
		else {
			$('#mic-slider').val(micVolume);
			webrtc.unmute();
		}
		$('#mic-volume').html($('#mic-slider').val());
		webrtc.setMicIfEnabled(50);
	});
	
	$('#audio-checkbox').change(function() {
		if(this.checked) {
			audioVolume = $('#audio-slider').val();
			$('#audio-slider').val("0");
			webrtc.pause();
		}
		else {
			$('#audio-slider').val(audioVolume);
			webrtc.resume();
		}
		$('#audio-volume').html($('#audio-slider').val());
	});
	
	$('.bottom').mouseover(function() {
		$('.bottom').addClass("active");
		$('.bottom:after').addClass("active");
	}).mouseout(function() {
		$('.bottom').removeClass("active");
		$('.bottom:after').removeClass("active");
	});
	
	$('.bottom').click(function() {
		$('.settings-button')[0].click();
	});
	
	$('#logout').click(function() {
		socket.emit('logout');
		window.location.href = "/";
	});
	
	$('#room-list').on("mouseover", '.room', function() {
		$('#' + this.id + ' .rooms.options').css({"visibility": "visible"});
	}).on("mouseout", '.room', function() {
		$('#' + this.id + ' .rooms.options').css({"visibility": "hidden"});
	});
	
	$('#room-list').on("mouseover", '.user', function() {
		$('#' + this.id + ' .users.options').css({"visibility": "visible"});
	}).on("mouseout", '.user', function() {
		$('#' + this.id + ' .users.options').css({"visibility": "hidden"});
	});
	
	$('#new-room-button').click(function() {
		var room = $('#new-room').val();
		if(room != "" && room.length < 11) {
			
			var ok = true;
			if(room.match(/[^A-Za-z0-9\-_]/)){
				createDiv("Lobby contains illegal characters");
				ok = false;
			}
			
			if(ok) {
			
				var res = null;
				$.ajax({
					url			:	"php/createroom.php",
					datatype	: 	"html",
					type		: 	"post",
					async		: 	false,
					data: {
						lobby	:	getCookie("lobby"),
						room	: 	room,
						user	:	getCookie("user")
					},
					success		:	function(response) { res = parseInt(response); }
				});
					
				if(res == 0) {			// User is not admin.
					createDiv("You don't have permission to do that.");
				}
				else if(res == 1) {		// Room already exists.
					createDiv("Room <span style='font-weight:600'>" + room + "</span> already exists.");
				}
				else if(res == 2) {		// Update room list with the new room.
					socket.emit('add room', {lobby: getCookie("lobby"), room: room});
					createDiv("Added room <span style='font-weight:600'>" + room + "</span>.");
				}
				else {
					createDiv("error");
				}
				$('#new-room').val("");
			}
		}
		else if(room.length > 10) {
			createDiv("Room name must be between 2 and 10 characters long.");
			$('#new-room').focus();
		}
		else {
			$('#new-room').focus();
		}
	});
	
	$('#room-list').on("dblclick", '.room', function() {
		$('#join-' + this.id.substring(6)).click();
	});
	
	$('#room-list').on("click", '.options-button.join', function() {
		//join room
		var user = getCookie("user"),
			lobby = getCookie("lobby"),
			room = getCookie("room");
		var id = this.id.split("-")[1];
		if(id != room) {
			var res = null;
			$.ajax({
				url			:	"php/joinroom.php",
				datatype	: 	"html",
				type		: 	"post",
				async		: 	false,
				data: {
					lobby	:	lobby,
					room	: 	id,
					user	:	user
				},
				success		:	function(response) { res = parseInt(response); }
			});
			
			if(res == 0) {			// Couldn't join room
				createDiv("Couldn't join room <span style='font-weight:600'>" + s + "</span>.");
			}
			else if(res == 1) {		// Joined room
				socket.emit('move', {user: user, to: id, from: room, lobby: lobby});
				updateCookie({room: id});
				createDiv("Joined room <span style='font-weight:600'>" + id + "</span>.");
				window.location.hash = id;
			}
		}
	});
	
	$('#room-list').on("click", '.options-button.leave', function() {
		var user = getCookie("user"),
			lobby = getCookie("lobby"),
			room = getCookie("room");
		var id = this.id.split("-")[1];
		var res = null;
		$.ajax({
			url			:	"php/joinroom.php",
			datatype	: 	"html",
			type		: 	"post",
			async		: 	false,
			data: {
				lobby	:	lobby,
				room	: 	"null",
				user	:	user
			},
			success		:	function(response) { res = parseInt(response); }
		});
		
		if(res == 1) {		// if res = ok
			socket.emit('move', {user: user, to: null, from: room, lobby: lobby}); 
			updateCookie({room: "null"});
			createDiv("Left room <span style='font-weight:600'>" + room + "</span>.");
			window.location.hash = "";
		}
	});
	
	$('#room-list').on("click", '.options-button.del', function() {
		//delete room
		var user = getCookie("user"),
			lobby = getCookie("lobby"),
			room = getCookie("room");
		var id = this.id.split("-")[1];
		var res = null;
		$.ajax({
			url			:	"php/deleteroom.php",
			datatype	: 	"html",
			type		: 	"post",
			async		: 	false,
			data: {
				lobby	:	lobby,
				room	: 	id,
				user	: 	user
			},
			success		:	function(response) { res = parseInt(response); }
		});
		
		if(res == 0) {
			createDiv("You don't have permission to do that.");
		}
		else if(res == 1) {
			createDiv("Couldn't delete room <span style='font-weight:600'>" + room + "</span>.");
		}
		else if(res == 2) {
			createDiv("Deleted room <span style='font-weight:600'>" + id + "</span>.");
			socket.emit('delete', {room: id, lobby: lobby} );
		}
	});
	
	$('#room-list').on("click", '.options-button.mod', function() {
		var user = getCookie("user"),
			lobby = getCookie("lobby"),
			room = getCookie("room");
		var id = this.id.split("-")[1];
		var res = null;
		$.ajax({
			url			: 	"php/mod.php",
			datatype	: 	"html",
			type		: 	"post",
			async 		: 	false,
			data: {
				user 	: 	user,
				mod 	: 	id,
				unmod	: 	null,
				lobby 	: 	lobby
			}, 
			success 	: 	function(response) { res = parseInt(response); }
		});
		
		if(res == 0) {
			createDiv("You don't have permission to do that.");
		}
		else if(res == 1) {
			createDiv("User " + id + " wasn't found.");
		}
		else if(res == 2) {
			createDiv("<span style='font-weight:600'>" + id + "</span> is now mod.");
			socket.emit('mod', {user: id, lobby: lobby});
		}
	});
	
	$('#room-list').on("click", '.options-button.unmod', function() {
		var user = getCookie("user"),
			lobby = getCookie("lobby"),
			room = getCookie("room");
		var id = this.id.split("-")[1];
		var res = null;
		$.ajax({
			url			: 	"php/mod.php",
			datatype	: 	"html",
			type		: 	"post",
			async 		: 	false,
			data: {
				user 	: 	user,
				mod 	: 	null,
				unmod	: 	id,
				lobby 	: 	lobby
			}, 
			success 	: 	function(response) { res = parseInt(response); }
		});
		
		if(res == 0) {
			createDiv("You don't have permission to do that.");
		}
		else if(res == 1) {
			createDiv("User <span style='font-weight:600'>" + id + "</span> wasn't found.");
		}
		else if(res == 2) {
			createDiv("<span style='font-weight:600'>" + id + "</span> is no longer mod.");
			socket.emit('unmod', {user: id, lobby: lobby});
		}
	});
	
	$('#room-list').on("click", '.options-button.kick', function() {
		var user = getCookie("user"),
			lobby = getCookie("lobby");
		var id = this.id.split("-")[1];
		
		var res = null;
		$.ajax({
			url			: 	"php/kick.php",
			datatype	: 	"html",
			type		: 	"post",
			async 		: 	false,
			data: {
				user 	: 	user,
				lobby 	: 	lobby,
				kick	: 	id
			}, 
			success 	: 	function(response) { res = parseInt(response); }
		});
		
		if(res == 0) {
			createDiv("You don't have permission to do that.");
		}
		else if(res == 1) {
			createDiv("User <span style='font-weight:600'>" + id + "</span> wasn't found.");
		}
		else if(res == 2) {
			createDiv("<span style='font-weight:600'>" + id + "</span> was kicked from the lobby.");
			socket.emit('kick', {lobby: lobby, user: id});
		}
	});
	
	$('.menu').mouseenter(function() {
		$('.menu-options').addClass("active");
	}).mouseleave(function() {
		$('.menu-options').removeClass("active");
	});
	
	$('.menu-options').mouseenter(function() {
		$(this).addClass("active");
	}).mouseleave(function() {
		$(this).removeClass("active");
	});
	
	$('#mic').click(function() {
		$(this).toggleClass("off");
	});
	
	$('#audio').click(function() {
		$(this).toggleClass("off");
	});
	
	$('div.mic').mouseover(function() {
		$(this).addClass("active");
		$('.mic-control').addClass("active");
	}).mouseleave(function() {
		$(this).removeClass("active");
		$('.mic-control').removeClass("active");
	});
	
	$('.menu-options').on("mouseover", '#mic-control', function() {
		$('div.mic').addClass("active");
		$(this).addClass("active");
	}).on("mouseout", '#mic-control', function() {
		$('div.mic').removeClass("active");
		$(this).removeClass("active");
	});
	
	$('#mic').click(function() {
		if($(this).hasClass("off")) {
			mic = $('input.mic').val();
			$('input.mic').val(0);
			if(!$('.ptt-box').hasClass("active"))
				webrtc.mute();
		}
		else {
			$('input.mic').val(mic);
			if(!$('.ptt-box').hasClass("active"))
				webrtc.unmute();
		}
	});
	
	$('#audio').click(function() {
		if($(this).hasClass("off"))  {
			audio = $('input.audio').val();
			$('input.audio').val(0);
			webrtc.pause();
		}
		else {
			$('input.audio').val(audio);
			webrtc.resume();
		}
	});
	
	$('div.audio').mouseover(function() {
		$(this).addClass("active");
		$('#audio-control').addClass("active");
	}).mouseout(function() {
		$(this).removeClass("active");
		$('#audio-control').removeClass("active");
	});
	
	$('.menu-options').on("mouseover", '#audio-control', function() {
		$('div.audio').addClass("active");
		$(this).addClass("active");
	}).on("mouseout", '#audio-control', function() {
		$('div.audio').removeClass("active");
		$(this).removeClass("active");
	});
	
	$('.ptt').mousedown(function() {
		if($('.ptt-box').hasClass("active") && !$('#mic').hasClass("off")) {
			webrtc.unmute();
			$('#ptt').addClass("pulse");
		}
	}).mouseup(function() {
		if($('.ptt-box').hasClass("active")) {
			webrtc.mute();
			$('#ptt').removeClass("pulse");
		}
	}).mouseleave(function() {
		if($('.ptt-box').hasClass("active")) {
			webrtc.mute();
			$('#ptt').removeClass("pulse");
		}
	});
	
	$('.ptt-box').click(function() {
		if($(this).hasClass("active")) {
			if(!$('#mic').hasClass("off")) 
				webrtc.unmute();
		}
		else {
			webrtc.mute();
		}
		$(this).toggleClass("active");
	});
	
	$('#show-menu').click(function() {
		$('#chat-window').toggleClass("open");
		$('.menu').toggleClass("open");
	});
});