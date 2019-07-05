/* eslint-env browser */
/*
	global
		Plyr
*/

const isPi = require('detect-rpi');
const omxplayer = require('../../../omxplayer');
const video = document.querySelector('video');
video.addEventListener('error', event => {
	const error = event.path[0].error;
	alert(error.message);
}, true);

const player = new Plyr(video, {
	controls: [
		'play-large',
		'play',
		'progress',
		'current-time',
		'duration',
	],
	keyboard: {
		focused: false,
		global: true
	}
});

const playerWrapper = document.getElementById('player-wrapper');

function showPlayer() {
	if (!playerOpen()) {
		playerWrapper.classList.remove('hide');
	}
}

function hidePlayer() {
	if (playerOpen()) {
		playerWrapper.classList.add('hide');
	}
}

function playerOpen() {
	return !playerWrapper.classList.contains('hide');
}

function setPlayerBackground(image) {
	player.poster = image;
}

function startStream(source) {
	if (isPi()) { // Pi's get to use omxplayer until I find something better
		omxplayer.init(source);
		omxplayer.play();
	} else { // Non-pi systems get Plyr
		if (video.src !== source) {
			video.src = source;
		} else {
			player.play();
		}
	
		showPlayer();
	}
}

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.startStream = startStream;
	this.showPlayer = showPlayer;
	this.hidePlayer = hidePlayer;
	this.playerOpen = playerOpen;
	this.setPlayerBackground = setPlayerBackground;
}();