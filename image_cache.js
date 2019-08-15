const got = require('got');
const fs = require('fs-extra');
const log = require('electron-log');
const { md5 } = require('./util/helpers');
const {remote, app} = require('electron');

function imageCache(url, callback) {
	const root = (app ? app.getPath('userData').replace(/\\/g, '/') : remote.app.getPath('userData').replace(/\\/g, '/'));
	const hash = md5(url);
	const imagePath = `${root}/imageCache/${hash}.jpg`;

	if (fs.pathExistsSync(imagePath)) {
		if (callback) {
			return callback(imagePath);
		}

		return imagePath;
	}

	log.info(`Caching image ${url}`);

	const writeStream = fs.createWriteStream(imagePath);
	const readStream = got.stream(url);

	if (callback) {
		readStream.pipe(writeStream);
		writeStream.on('close', () => {
			return callback(imagePath);
		});
	} else {
		return new Promise(resolve => {
			readStream.pipe(writeStream);
			writeStream.on('close', () => {
				return resolve(imagePath);
			});
		});
	}
	
}

module.exports = imageCache;