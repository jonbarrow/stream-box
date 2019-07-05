const got = require('got');
const helpers = require('./helpers');

// Data URLS
const TRAKT_URL_BASE = 'http://api.trakt.tv';
const TRAKT_TRENDING_MOVIES = `${TRAKT_URL_BASE}/movies/trending?extended=full`;
const TRAKT_TRENDING_SHOWS = `${TRAKT_URL_BASE}/shows/trending`;
const TRAKT_SEARCH_MOVIES = `${TRAKT_URL_BASE}/search/movie/?query`;
const TRAKT_SEARCH_SHOWS = `${TRAKT_URL_BASE}/search/show/?query`;
const TRAKT_DETAILS_MOVIE = `${TRAKT_URL_BASE}/movies`;
const TRAKT_DETAILS_SHOW = `${TRAKT_URL_BASE}/shows`;
const TRAKT_CAST_MOVIE = `${TRAKT_URL_BASE}/movies/{}/people`;

const TRAKT_API_KEYS = [
	'acc97918ace2b0a211957d574e7cd7c7bc7a59b9c949df625077f1d5fb107082',
	'42740047aba33b1f04c1ba3893ce805a9ecfebd05de544a30fe0c99fabec972e',
	'4feebb4e3791029816a401952c09fa5b446ed4a81b01d600031e422f0d3ae86d',
	'1ba47e601d5db0b02965f703621db88aedc02390830d9cbad0edc357e03f47fd',
	'd4161a7a106424551add171e5470112e4afdaf2438e6ef2fe0548edc75924868',
	'233fcb9838282957f4d5b6f4fdd7d0167bb8344bcd2463eaaa9cfc4a659da9b5',
	'ba7c78f4d23246ba1be0a33acaa74b6d91cd805b0bc35623612bad99e0bf8f31',
	'07f62f518897521feb214e2be70b2ac1a4b498a39baf847eac0e734102ad2f4a',
	'c1aa5a18c171bf2e33dd5185d5f22d99fc01efa0b5303b1f4806a17160cee4cf',
	'd2a7a0ca1dbe8300bcfa5f0e1d38e10e03403ee7769e390f636411d18bbcc00e',
	'e3241d30014ea9657997695fae248f5369fff759daed9a3400e7b9cffb6f6c62',
	'a0c9e1842e5b4bd2fa07bd814a13659b5e6561b9d556144a6ddb73c838844a6b',
	'6dacbd2fb9d8563ab80756a8b3ab54ec1dc85ffee6be3dbca75505fc7fe197d1',
	'7095b0f03bd221ce3d368c6fc0f196400d12c86337825f6c7e46b05d0143e490',
	'2a3022a90d1e592cabe6590cb30c0cc53003ac35de76dd740365e717a134968b',
	'5cc0df48ea07aaa96e15d8152cb9911b253391138cdd4e777cd6ee1aa6188d0a',
	'ad005b8c117cdeee58a1bdb7089ea31386cd489b21e14b19818c91511f12a086',
	'bb010eab6d293013e9a901a64adeda1e783aeac71d744262f68cc2aeb762ab2e',
	'58204fc7a1d802e428755a14e4ce59840dcc1b8ac6add88ead921e8f129b71c1',
	'afd1ac6be8b653799ceaeb60c73450a76063df95d1464fef8d514f83c23d92b9',
	'468a92c26d3411be7886881b7f40afea47288963a91d9c5a0f43257521ceab74',
	'56ec419c2290fb47abda0d48f0bb7e574a73d0ab65aa3b3ee1c877b193d2709a',
	'b0193b6297b2e397aeef7b832872e50752eae47b10c809f8dec7b98f34aafab1',
	'4122c40ed43a1f9a8f015538f4b6a80c8ef4e76601b91576982820d955df3f9f'
];

async function traktRequest(url) {
	const trakt_key = helpers.pickRand(TRAKT_API_KEYS);
	const response = await got(url, {
		json: true,
		headers: {
			'trakt-api-key': trakt_key,
			'trakt-api-version': 2,
		}
	});

	return response.body;
	
}

async function trendingMovies() {
	return await traktRequest(TRAKT_TRENDING_MOVIES);
}

async function trendingShows() {
	return await traktRequest(TRAKT_TRENDING_SHOWS);
}

async function searchMovies(query) {
	return await traktRequest(`${TRAKT_SEARCH_MOVIES}=${query}`);
}

async function searchShows(query) {
	return await traktRequest(`${TRAKT_SEARCH_SHOWS}=${query}`);
}

async function movieDetails(id, extended) {
	let url = `${TRAKT_DETAILS_MOVIE}/${id}`;
	if (extended) {
		url += '?extended=full';
	}

	return await traktRequest(url);
}

async function showDetails(id, extended) {
	let url = `${TRAKT_DETAILS_SHOW}/${id}`;
	if (extended) {
		url += '?extended=full';
	}

	return await traktRequest(url);
}

async function moviePeople(id) {
	return await traktRequest(helpers.format(TRAKT_CAST_MOVIE, id));
}

async function movieCast(id) {
	const {cast} = await moviePeople(id);
	return cast;
}

module.exports = {
	trendingMovies,
	trendingShows,
	searchMovies,
	searchShows,
	movieDetails,
	showDetails,
	movieCast
};