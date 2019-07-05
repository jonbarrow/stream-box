const childProcess = require('child_process');
let OMXPLAYER_PROCESS;

function init(source) {
	if (OMXPLAYER_PROCESS) {
		quit();
		OMXPLAYER_PROCESS.kill();
	}

	const _arguments = ['-o', 'hdmi', source];

	OMXPLAYER_PROCESS = childProcess.spawn('omxplayer', _arguments);
}

function writeCommand(command) {
	if (OMXPLAYER_PROCESS) {
		OMXPLAYER_PROCESS.stdin.write(command);
	}
}

function play() {
	writeCommand('p');
}

function pause() {
	writeCommand('p');
}

function quit() {
	writeCommand('q');
}

module.exports = {
	init,
	play,
	pause,
	quit,
};