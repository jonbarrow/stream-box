/* eslint-env browser */
/*
	global
		Plyr
*/

const isPi = require('detect-rpi');
const omxplayer = require('../omxplayer');
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
	]
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
	document.addEventListener('keydown', event => {
		if (!omxplayer.isPlaying()) {
			return;
		}

		event.preventDefault();
		
		const {key} = event;
		
		switch (key) {
			case '1':
				omxplayer.decreaseSpeed();
				break;
			case '2':
				omxplayer.increaseSpeed();
				break;
			case '<':
				omxplayer.rewind();
				break;
			case '>':
				omxplayer.fastForward();
				break;
			case 'z':
				omxplayer.showInfo();
				break;
			case 'j':
				omxplayer.previousAudioStream();
				break;
			case 'k':
				omxplayer.nextAudioStream();
				break;
			case 'i':
				omxplayer.previousChapter();
				break;
			case 'o':
				omxplayer.nextChapter();
				break;
			case 'n':
				omxplayer.previousSubtitleStream();
				break;
			case 'm':
				omxplayer.nextSubtitleStream();
				break;
			case 's':
				omxplayer.toggleSubtitles();
				break;
			case 'w':
				omxplayer.showSubtitles();
				break;
			case 'x':
				omxplayer.hideSubtitles();
				break;
			case 'd':
				omxplayer.decreaseSubtitleDelay();
				break;
			case 'f':
				omxplayer.increaseSubtitleDelay();
				break;
			case 'q':
				omxplayer.quit();
				break;
			case 'p': case ' ':
				omxplayer.togglePlay();
				break;
			case '-':
				omxplayer.decreaseVolume();
				break;
			case '+': case '=':
				omxplayer.increaseVolume();
				break;
			case 'ArrowLeft':
				omxplayer.seekBack30();
				break;
			case 'ArrowRight':
				omxplayer.seekForward30();
				break;
			case 'ArrowDown':
				omxplayer.seekBack600();
				break;
			case 'ArrowUp':
				omxplayer.seekForward600();
				break;
		}
	});

	this.startStream = startStream;
	this.showPlayer = showPlayer;
	this.hidePlayer = hidePlayer;
	this.playerOpen = playerOpen;
	this.setPlayerBackground = setPlayerBackground;
}();
