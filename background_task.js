const { BrowserWindow } = require('electron');
const url = require('url');
const { EventEmitter } = require('events');

class BackgroundTask extends EventEmitter {
	constructor(path) {
		super();

		this.killed = false;
		// Create the hidden browser window
		this.window = new BrowserWindow({
			show: false,
			webPreferences: {
				nodeIntegration: true
			}
		});
	
		// Sends when the window is ready to start getting and sending data
		this.window.webContents.on('did-finish-load', () => {
			this.emit('ready');
		});

		// Bubbles any IPC message in the form of an EventEmitter event
		this.window.webContents.on('ipc-message', (event, channel, data) => {
			this.emit(channel, data);
		});
	
		// Load the task
		this.window.loadURL(url.format({
			pathname: path,
			protocol: 'file:',
			slashes: true
		}));
	
		this.window.on('closed', () => {
			this.window = null;
		});
	}

	// Send data to the task
	send(name, data) {
		this.window.webContents.send(name, data);
	}

	// Kill the task
	kill() {
		this.window.destroy();
		this.killed = true;
	}
}

module.exports = BackgroundTask;