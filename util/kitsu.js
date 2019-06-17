const got = require('got');

// Data URLS
const KITSU_URL_BASE = 'https://kitsu.io/api';
const ANIME_DETAILS_URL = `${KITSU_URL_BASE}/edge/anime`;

// Required headers for Kitsu
const KITSU_HEADERS = {
	'Accept': 'application/vnd.api+json',
	'Content-Type': 'application/vnd.api+json'
};

async function details(kitsuID) {
	// Request the anime's data from Kitsu
	const response = await got(`${ANIME_DETAILS_URL}/${kitsuID}`, {
		json: true,
		headers: KITSU_HEADERS
	});
	const body = response.body;
	
	return body.data; // Grab the details
}

module.exports = {
	details
};