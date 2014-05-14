
function initVoip() {
	// grab the room from the URL
	var room = window.location.pathname.substring(1) + "#" + window.location.hash;
	// create our webrtc connection
	webrtc = new SimpleWebRTC({
		// the id/element dom element that will hold "our" video
		//localVideoEl: 'localVideo',
		// the id/element dom element that will hold remote videos
		//remoteVideosEl: '',
		// immediately ask for camera access
		autoRequestMedia: true,
		debug: false,
		detectSpeakingEvents: true,
		autoAdjustMic: false,
		enableDataChannels: true
	});
	
	// when it's ready, join if we got a room from the URL
	webrtc.once('readyToCall', function () {
		// you can name it anything
		if (room) webrtc.joinRoom(room);
	});
	
	webrtc.on('audioOff', function () {
		// you can name it anything
		webrtc.sendToAll('mute', {name: 'audio'});
	});
	
	// Since we use this twice we put it here
	function setRoom(name) {
		$('form').remove();
		$('h1').text(name);
		$('#subTitle').text('Link to join: ' + location.href);
		$('body').addClass('active');
	}
	
	if (room) {
		setRoom(room);
	} else {
		$('form').submit(function () {
			var val = $('#sessionInput').val().toLowerCase().replace(/\s/g, '-').replace(/[^A-Za-z0-9_\-]/g, '');
			webrtc.createRoom(val, function (err, name) {
				console.log(' create room cb', arguments);
			
				var newUrl = location.pathname + '?' + name;
				if (!err) {
					history.replaceState({foo: 'bar'}, null, newUrl);
					setRoom(name);
				} else {
					console.log(err);
					
				}
			});
			return false;          
		});
	}
}
function stopVoip(){
	webrtc.leaveRoom();
	webrtc.connection.disconnect();
	
}
