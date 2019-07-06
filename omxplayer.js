const childProcess = require('child_process');
let OMXPLAYER_PROCESS;

function init(source) {
	if (OMXPLAYER_PROCESS) {
		quit();
		OMXPLAYER_PROCESS.kill();
	}

	const _arguments = ['-o', 'hdmi', source];

	OMXPLAYER_PROCESS = childProcess.spawn('omxplayer', _arguments, {
		stdio: [process.stdin, process.stdout, process.stderr]
	});
}

function writeCommand(command) {
	if (!command.endsWith('\n')) {
		command = `${command}\n`;
	}
	
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