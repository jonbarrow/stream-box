const childProcess = require('child_process');
let OMXPLAYER_PROCESS;
let playing = false;
let paused = false;

function writeCommand(command) {
	if (OMXPLAYER_PROCESS) {
		OMXPLAYER_PROCESS.stdin.write(command);
	}
}

function init(source) {
	if (OMXPLAYER_PROCESS) {
		quit();
		if (!OMXPLAYER_PROCESS.killed) {
			OMXPLAYER_PROCESS.kill();
		}
	}

	const _arguments = ['-o', 'hdmi', source];

	OMXPLAYER_PROCESS = childProcess.spawn('omxplayer', _arguments);
	
	playing = true;

	OMXPLAYER_PROCESS.on('close', () => {
		OMXPLAYER_PROCESS = null;
		playing = false;
		paused = false;
	});

	return OMXPLAYER_PROCESS;
}

function isPlaying() {
	return playing;
}

function play() {
	if (paused) {
		togglePlay();
	}
}

function pause() {
	if (!paused) {
		togglePlay();
	}
}

function decreaseSpeed() {
	writeCommand(1);
}

function increaseSpeed() {
	writeCommand(2);
}

function rewind() {
	writeCommand('<');
}

function fastForward() {
	writeCommand('>');
}

function showInfo() {
	writeCommand('z');
}

function previousAudioStream() {
	writeCommand('j');
}

function nextAudioStream() {
	writeCommand('k');
}

function previousChapter() {
	writeCommand('i');
}

function nextChapter() {
	writeCommand('o');
}

function previousSubtitleStream() {
	writeCommand('n');
}

function nextSubtitleStream() {
	writeCommand('m');
}

function toggleSubtitles() {
	writeCommand('s');
}

function showSubtitles() {
	writeCommand('w');
}

function hideSubtitles() {
	writeCommand('x');
}

function decreaseSubtitleDelay() {
	writeCommand('d');
}

function increaseSubtitleDelay() {
	writeCommand('f');
}

function quit() {
	writeCommand('q');
}

function togglePlay() {
	paused = !paused;
	writeCommand('p');
}

function decreaseVolume() {
	writeCommand('-');
}

function increaseVolume() {
	writeCommand('+');
}

function seekBack30() {
	writeCommand('\u001b[D');
}

function seekForward30() {
	writeCommand('\u001b[C');
}

function seekBack600() {
	writeCommand('\u001b[B');
}

function seekForward600() {
	writeCommand('\u001b[A');
}


module.exports = {
	isPlaying,
	init,
	play,
	pause,
	decreaseSpeed,
	increaseSpeed,
	rewind,
	fastForward,
	showInfo,
	previousAudioStream,
	nextAudioStream,
	previousChapter,
	nextChapter,
	previousSubtitleStream,
	nextSubtitleStream,
	toggleSubtitles,
	showSubtitles,
	hideSubtitles,
	decreaseSubtitleDelay,
	increaseSubtitleDelay,
	quit,
	togglePlay,
	decreaseVolume,
	increaseVolume,
	seekBack30,
	seekForward30,
	seekBack600,
	seekForward600,
};
