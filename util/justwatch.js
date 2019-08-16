const got = require('got');

// Data URLS
const API_BASE = 'https://apis.justwatch.com';
const API_SEARCH = `${API_BASE}/content/titles/en_US/popular`;
const API_POPULAR = `${API_BASE}/content/titles/en_US/popular`;
const API_MOVIE_DETAILS = `${API_BASE}/content/titles/movie/{id}/locale/en_US`;
const API_SHOW_DETAILS = `${API_BASE}/content/titles/show/{id}/locale/en_US`;
const API_SEASON_DETAILS = `${API_BASE}/content/titles/show_season/{id}/locale/en_US`;
const API_RECOMMENDATIONS = `${API_BASE}/content/titles/en_US/recommendations`;

async function getPopularMovies(page=1) {
	const body = JSON.stringify({
		content_types: ['movie'],
		page
	});

	const response = await got(`${API_POPULAR}?body=${body}`, {
		json: true
	});
	
	return response.body;
}

async function getPopularTVShows(page=1) {
	const body = JSON.stringify({
		content_types: ['show'],
		page
	});

	const response = await got(`${API_POPULAR}?body=${body}`, {
		json: true
	});
	
	return response.body;
}

async function searchAll(query, page=1, pageSize=0) {
	const body = JSON.stringify({
		content_types: ['movie', 'show'],
		page,
		page_size: pageSize,
		query
	});

	const response = await got(`${API_SEARCH}?body=${body}`, {
		json: true
	});
	
	return response.body;
}

async function searchMovies(query, page=1, pageSize=0) {
	const body = JSON.stringify({
		content_types: ['movie'],
		page,
		page_size: pageSize,
		query
	});

	const response = await got(`${API_SEARCH}?body=${body}`, {
		json: true
	});
	
	return response.body;
}

async function searchShows(query, page=1, pageSize=0) {
	const body = JSON.stringify({
		content_types: ['show'],
		page,
		page_size: pageSize,
		query
	});

	const response = await got(`${API_SEARCH}?body=${body}`, {
		json: true
	});
	
	return response.body;
}


async function movieDetails(id) {
	const response = await got(API_MOVIE_DETAILS.replace('{id}', id), {
		json: true
	});
	
	return response.body;
}

async function showDetails(id) {
	const response = await got(API_SHOW_DETAILS.replace('{id}', id), {
		json: true
	});
	
	return response.body;
}

async function seasonDetails(id) {
	const response = await got(API_SEASON_DETAILS.replace('{id}', id), {
		json: true
	});
	
	return response.body;
}

async function relatedMedia(id, type) {
	let prefix = 't';

	switch(type) {
		case 'movie':
			prefix += 'm';
			break;
		case 'show':
			prefix += 's';
			break;
	}

	const body = JSON.stringify({
		page_size: 12,
		page: 1
	});

	const response = await got(`${API_RECOMMENDATIONS}?jw_entity_ids=${prefix}${id}&body=${body}`, {
		json: true
	});
	
	return response.body;
}

module.exports = {
	getPopularMovies,
	getPopularTVShows,
	searchAll,
	searchMovies,
	searchShows,
	movieDetails,
	showDetails,
	seasonDetails,
	relatedMedia
};