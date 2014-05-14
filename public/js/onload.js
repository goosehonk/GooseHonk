// JavaScript Document

$(window).load(function(){
	$('#channel').focus();
	
	window.setTimeout(function () {
        document.getElementById('message').focus();
    }, 0);
	
	$('#chat-window').stop().hide().fadeIn(500);
	$('.chat-window-content').stop().delay(200).animate({
  		scrollTop: $(".chat-window-content")[0].scrollHeight
	}, 500);
});