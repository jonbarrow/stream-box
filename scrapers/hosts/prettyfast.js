const got = require('got');

const REGEX = /file: '(.*)'/;

async function scrape(embedURL, referer) {
	const response = await got(embedURL, {
		throwHttpErrors: false,
		headers: {
			Referer: referer
		}
	});
	const body = response.body;

	const REGEX_DATA = REGEX.exec(body);
	
	if (!REGEX_DATA || !REGEX_DATA[1]) {
		return null;
	}

	const playlistUrl = REGEX_DATA[1];

	return playlistUrl;
}

module.exports = {
	scrape
};