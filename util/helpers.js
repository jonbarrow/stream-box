const crypto = require('crypto');

function format(string, value, format='{}') {
	return string.replace(format, value);
}

function pickRand(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function mergeArrays(...arrays) {
	return [...new Set([].concat(...arrays))];
}

function md5(string) {
	return crypto.createHash('md5').update(string).digest('hex');
}

module.exports = {
	pickRand,
	format,
	mergeArrays,
	md5
};