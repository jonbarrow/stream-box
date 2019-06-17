const got = require('got');
const helpers = require('./helpers');

// Data URLS
const FANARTTV_URL_BASE = 'https://webservice.fanart.tv/v3';
const FANARTTV_IMAGES_MOVIE = `${FANARTTV_URL_BASE}/movies`;

const FANARTTV_API_KEYS = [
	'ed4b784f97227358b31ca4dd966a04f1',
];

async function fanarttvRequest(url) {
	const fanarttv_key = helpers.pickRand(FANARTTV_API_KEYS);
	const response = await got(`${url}?api_key=${fanarttv_key}`, {
		json: true
	});

	return response.body;
	
}

async function movieImages(id) {
	return await fanarttvRequest(`${FANARTTV_IMAGES_MOVIE}/${id}`);
}

module.exports = {
	movieImages,
};