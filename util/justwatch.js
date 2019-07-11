const got = require('got');

// Data URLS
const API_BASE = 'https://apis.justwatch.com';
const API_SEARCH = `${API_BASE}/content/titles/en_US/popular`;
const API_POPULAR = `${API_BASE}/content/titles/en_US/popular`;
const API_MOVIE_DETAILS = `${API_BASE}/content/titles/movie/{id}/locale/en_US`;
const API_SHOW_DETAILS = `${API_BASE}/content/titles/show/{id}/locale/en_US`;
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
	relatedMedia
};

/*

Content search: https://apis.justwatch.com/content/titles/en_US/popular?body=%7B%22content_types%22:[%22movie%22],%22page%22:1,%22page_size%22:1,%22query%22:%22SEARCH_QUERY%22%7D

content_types: array of types to search for (movie, show, person, ect)
page: the search page (based on page_size)
page_size: max number of items returned for this query (removing this seems to return all items)
query: the search query


Additional links (translation links and movie tickets link): https://apis.justwatch.com/content/urls?include_children=true&path=/us/movie/howls-moving-castle

include_children: Not entirely sure what "children" means, seems to always add an array with always one element being a link to buy movie tickets for a given movie
path: the path to the movie on the website


Detailed information https://apis.justwatch.com/content/titles/movie/MOVIE_OBJECT_ID/locale/LOCALE

MOVIE_OBJECT_ID: the movie ID on the website, can be gotten from the "Additional links" endpoint
LOCALE: region locale, like en_US


Movie recommendations based on the input movie: https://apis.justwatch.com/content/titles/en_US/recommendations?body=%7B%22page_size%22:1,%22page%22:1%7D&jw_entity_ids=ENTITY_ID

page_size: max number of items returned for this query (removing this seems to return all items)
page: the search page (based on page_size)
jw_entity_ids: literally just the MOVIE_OBJECT_ID from above but prefixed with 'tm' (such as tm79928 for Howls Moving Castle)

*/