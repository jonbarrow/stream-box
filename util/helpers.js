function format(string, value, format='{}') {
	return string.replace(format, value);
}

function pickRand(array) {
	return array[Math.floor(Math.random() * array.length)];
}

function mergeArrays(...arrays) {
	return [...new Set([].concat(...arrays))];
}

module.exports = {
	pickRand,
	format,
	mergeArrays
};