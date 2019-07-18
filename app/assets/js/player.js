/* eslint-env browser */
/*
	global
		Plyr
		Hls
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

player.on('canplay', () => {
	player.play();
});

const playerWrapper = document.getElementById('player-wrapper');

function showPlayer() {
	if (!playerOpen()) {
		playerWrapper.classList.remove('hide');
	}
}

function hidePlayer() {
	if (player.playing) {
		player.pause();
	}

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

function startStream(stream) {
	if (isPi()) { // Pi's get to use omxplayer until I find something better
		omxplayer.init(stream.file);
	} else { // Non-pi systems get Plyr
		if (stream.m3u8) {
			if (Hls.isSupported()) {
				console.log(`Hls.isSupported() ${stream.file}`);
				const hls = new Hls();
				hls.loadSource(stream.file);
				hls.attachMedia(video);
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					video.play();
				});
			} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
				console.log(`video.canPlayType('application/vnd.apple.mpegurl') ${stream.file}`);
				video.src = stream.file;
				video.addEventListener('loadedmetadata', () => {
					video.play();
				});
			}
		} else {
			if (video.src !== stream.file) {
				video.src = stream.file;
			} else {
				player.play();
			}
		}
	
		showPlayer();
	}
}

function piKeyHandle(event) {
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
}

function keyHandle(event) {

	if (player.playing) {
		event.preventDefault();
	}
	
	const {key} = event;

	if (key === 'Escape' && player.playing) {
		hidePlayer();
	}
}

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	document.addEventListener('keydown', event => {
		if (isPi()) {
			piKeyHandle(event);
		} else {
			keyHandle(event);
		}
	});

	this.startStream = startStream;
	this.showPlayer = showPlayer;
	this.hidePlayer = hidePlayer;
	this.playerOpen = playerOpen;
	this.setPlayerBackground = setPlayerBackground;
}();
