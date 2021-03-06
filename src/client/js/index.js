'use strict';

const chat = require('./chat');
const partner = require('./partner');
const preferences = require('./preferences');
const user = require('./user');

// Initalize user client information
user.init();

// Create connection to server
const socket = new WebSocket(''+(location.protocol == 'https' ? 'wss' : 'ws')+'://'+location.hostname+(location.port ? ':'+location.port : '')+'?id='+user.getId());

// Server responses
socket.addEventListener('close', function (event) {
	user.setPartner(false);
});

socket.addEventListener('error', function (event) {
	console.log('Error: '+event);
});

socket.addEventListener('message', function (event) {
	const response = JSON.parse(event.data);

	switch(response.type) {
		case 'connection_success':
			user.setId(response.data);
		break;
		case 'connection_exists':
			alert('You already have an active session.');
			return false;
		break;
		case 'update_user_count':
			document.getElementById('userCount').innerText = response.data;
		break;
		case 'receive_message':
			chat.addChatMessage(response.data, {class: 'message-partner'});
		break;
		case 'partner_typing':
			if (response.data == true) {
				chat.showChatTyping();
			} else {
				chat.hideChatTyping();
			}
		break;
		case 'partner_connected':
			partner.connected(response.data);
		break;
		case 'partner_disconnected':
			partner.disconnected();
		break;
		case 'partner_left':
			partner.left();
		break;
		case 'partner_blocked':
			partner.blocked();
		break;
		case 'partner_pending':
			partner.pending();
		break;
		case 'invalid_links':
			chat.invalid();
		break;
		case 'invalid_preferences':
			preferences.invalid();
		break;
		case 'ping':

		break;
	}
});

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', preferences.init);

// When preferences menu button is clicked
document.getElementById('menu').addEventListener('click', preferences.toggleMenu);

// When save preferences button is clicked
document.getElementById('savePref').addEventListener('click', preferences.save);

// When message is submitted into chat
document.getElementById('messageBox').addEventListener('submit', function(e) {
	e.preventDefault();
	chat.sendMessage(socket);
});

// When key is pressed in message box / typing
document.getElementById('messageBox').addEventListener('input', function(e) {
	e.preventDefault();
	chat.sendTypingStatus(socket);
});

// When user requests to find partner by submitting preferences
document.getElementById('userSettings').addEventListener('submit', function(e) {
	e.preventDefault();
	partner.find(socket);
});

// When block partner button is clicked
document.getElementById('block-partner').addEventListener('click', function(e) {
	e.preventDefault();
	partner.block(socket);
});
