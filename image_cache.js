const got = require('got');
const fs = require('fs-extra');
const { md5 } = require('./util/helpers');
const {remote, app} = require('electron');

async function imageCache(url) {
	const root = (app ? app.getPath('userData').replace(/\\/g, '/') : remote.app.getPath('userData').replace(/\\/g, '/'));
	const hash = md5(url);
	const imagePath = `${root}/imageCache/${hash}.jpg`;

	if (fs.pathExistsSync(imagePath)) {
		return imagePath;
	}

	const writeStream = fs.createWriteStream(imagePath);
	const readStream = got.stream(url);

	return new Promise(resolve => {
		readStream.pipe(writeStream);
		writeStream.on('close', () => {
			return resolve(imagePath);
		});
	});
}

module.exports = imageCache;