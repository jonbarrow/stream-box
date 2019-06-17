const got = require('got');
const helpers = require('./helpers');

// Data URLS
const TMDB_URL_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMAGES_MOVIE = `${TMDB_URL_BASE}/movie/{}/images`;
const TMDB_IMAGES_PERSON = `${TMDB_URL_BASE}/person/{}/images`;


const TMDB_API_KEYS = [
	'1b8ef7391445ca75c8ced6a162117f9e',
	'92b2df3080b91d92b31eacb015fc5497',
	'9a8ea5fa60e29b4ffa2855dddda5dc13',
	'43ccb84b4bed97cf7a2eca5f9292e05b',
	'c2c42584d4de5aa4f0a9c22b0c4ceaa4',
	'c5faf8570229b9ae76311638b0557c56',
	'471d212907833bde6a872c6b03ecbfdb'
];

async function tmdbRequest(url) {

	const tmdb_key = helpers.pickRand(TMDB_API_KEYS);
	url = (url.includes('?') ? `${url}&api_key=${tmdb_key}` : `${url}?api_key=${tmdb_key}`);

	const {body} = await got(url, {
		json: true
	});

	return body;
	
}

async function movieImages(id) {
	return await tmdbRequest(helpers.format(TMDB_IMAGES_MOVIE, id));
}

async function personImages(id) {
	return await tmdbRequest(helpers.format(TMDB_IMAGES_PERSON, id));
}

module.exports = {
	movieImages,
	personImages
};