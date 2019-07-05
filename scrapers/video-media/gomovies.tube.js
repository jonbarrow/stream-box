const got = require('got');
const async = require('async');
const { JSDOM } = require('jsdom');
const hostScrapers = require('../hosts');

const URL_BASE = 'https://gomovies.tube';
const AJAX_BASE = `${URL_BASE}/ajax`;
const AJAX_SEARCH = `${AJAX_BASE}_search`;

const VALID_SERVERS = [
	'openload',
	'server_2',
	'server_4',
];

async function scrape(traktDetails, type) {
	if (type === 'movie') {
		return scrapeMovie(traktDetails);
	} else {
		// Add show support
		return null;
	}
}

async function scrapeMovie({title}) {
	let response = await got(`${AJAX_SEARCH}/captain`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest' // site 404's without this header
		}
	});
	let body = response.body;
	const dom = new JSDOM(body);

	const categories = [...dom.window.document.querySelectorAll('.searchItem_categories')]
		.map(category => ({
			type: category.querySelector('span').innerHTML.toLowerCase(),
			items: [...category.querySelectorAll('.searchItem_film')]
				.map(film => ({
					name: film.querySelector('.filmName').innerHTML.trim().replace(/\n/g, ''),
					href: film.href
				}))
		}));

	const movies = categories.find(({type}) => type === 'movies');

	if (!movies) {
		return null;
	}

	const movie = movies.items.find(({name}) => name === title);
	
	if (!movie) {
		return null;
	}

	response = await got(`${URL_BASE}${movie.href}?server=server_4`, {
		headers: {
			'X-Requested-With': 'XMLHttpRequest' // This gives us JSON lol
		},
		json: true
	});
	body = response.body;

	const streams = [];

	await new Promise(resolve => {
		async.each(VALID_SERVERS, (server, callback) => {
			got(`${URL_BASE}${movie.href}?server=${server}`, {
				headers: {
					'X-Requested-With': 'XMLHttpRequest' // This gives us JSON lol
				},
				json: true
			}).then(({body}) => {
				if (server === 'openload') {
					hostScrapers.OpenLoad.scrape(body.link)
						.then(openload => {
							if (openload) {
								streams.push({
									file_host: 'OpenLoad',
									file: openload
								});
							}

							callback();
						});
				} else {
					for (const stream of body) {
						streams.push({
							file_host: 'LoadShare', // Seems constant
							file: stream.src,
							quality: (stream.label ? stream.label : null)
						});
					}

					callback();
				}
			});
		}, resolve);
	});

	return streams;
}

module.exports = scrape;

/*
(async () => {
	console.time('scraping');
	const streams = await scrape({
		title: 'Captain Marvel',
		year: 2019,
		ids: {
			trakt: 193963,
			slug: 'captain-marvel-2019',
			imdb: 'tt4154664',
			tmdb: 299537
		}
	}, 'movie');
	console.timeEnd('scraping');

	console.log(streams);
})();
*/