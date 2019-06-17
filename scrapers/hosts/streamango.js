const got = require('got');
const JSON5 = require('json5');

const FORMATS_REGEX = /({[^}]*\bsrc\s*:\s*[^}]*})/;
const ENCODED_URL_REGEX = /src:d\((\S+)\)/;

const ALPHABET = '=/+9876543210zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA';

function decodeURL(url, seed) {
	const alphabetIndexs = [];
	let decoded = '';

	for (let i = 0; i < url.length;) {
		for (let j = 0; j < 4; j++) {
			alphabetIndexs[j % 4] = ALPHABET.indexOf(url[i]);
			i++;
		}

		let char_code = ((alphabetIndexs[0] << 2) | (alphabetIndexs[1] >> 4)) ^ seed;
		decoded += String.fromCharCode(char_code);

		if (alphabetIndexs[2] != 64) {
			char_code = ((alphabetIndexs[1] & 15) << 4) | (alphabetIndexs[2] >> 2);
			decoded += String.fromCharCode(char_code);
		}

		if (alphabetIndexs[3] != 64) {
			char_code = ((alphabetIndexs[2] & 3) << 6) | alphabetIndexs[3];
			decoded += String.fromCharCode(char_code);
		}
	}

	return decoded;
}

async function scrape(url) {
	const response = await got(url);
	const body = response.body;

	// Dirty check to see if the file exists
	if (body.includes('We are unable to find the video you\'re looking for. There could be several reasons for this, for example it got removed by the owner.')) {
		return null;
	}

	return parse(body);
}

function parse(body) {
	const formats = FORMATS_REGEX.exec(body);
	const streams = [];

	/*
	for (let format of formats) {
		format = format.replace(ENCODED_URL_REGEX, (match, p1) => {
			const encodedURLData = p1.split(',');
			return `encodedURL:${encodedURLData[0]},seed:${encodedURLData[1]}`;
		});
		
		const data = JSON5.parse(format);
		
		streams.push({
			source: decodeURL(data.encodedURL, data.seed),
			quality: `${data.height}p`
		});
	}
	*/

	const format = formats[1].replace(ENCODED_URL_REGEX, (match, p1) => {
		const encodedURLData = p1.split(',');
		return `encodedURL:${encodedURLData[0]},seed:${encodedURLData[1]}`;
	});
	
	const data = JSON5.parse(format);
	
	streams.push({
		source: decodeURL(data.encodedURL, data.seed),
		quality: `${data.height}p`
	});

	return streams;
}

module.exports = {
	scrape
};