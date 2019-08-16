const  { EventEmitter } = require('events');
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

class GoMovies extends EventEmitter {
	constructor() {
		super();
	}

	async scrape({title}, type) {
		if (type !== 'movie') { // This site supports TV shows! Need to add TV show support
			return this.emit('finished');
		}

		const response = await got(`${AJAX_SEARCH}/${title}`, {
			headers: {
				'X-Requested-With': 'XMLHttpRequest' // site 404's without this header
			}
		});
		const body = response.body;
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
			return this.emit('finished');
		}
	
		const movie = movies.items.find(({name}) => name === title);
		
		if (!movie) {
			return this.emit('finished');
		}
	
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
								this.emit('stream', {
									aggregator: 'gomovies',
									file_host: 'OpenLoad',
									file: openload
								});
							}

							callback();
						});
				} else {
					for (const stream of body) {
						this.emit('stream', {
							aggregator: 'gomovies',
							file_host: 'LoadShare', // Seems constant
							file: stream.src,
							quality: (stream.label ? stream.label : null)
						});
					}

					callback();
				}
			});
		}, () => {
			this.emit('finished');
		});
	}
}

module.exports = GoMovies;

/*
(async () => {
	const scraper = new GoMovies();

	scraper.on('stream', stream => {
		console.log(stream);
	});

	scraper.on('finished', () => {
		console.timeEnd('scraping');
	});
	
	console.time('scraping');
	scraper.scrape({
		title: 'Captain Marvel',
		year: 2019,
		ids: {
			trakt: 193963,
			slug: 'captain-marvel-2019',
			imdb: 'tt4154664',
			tmdb: 299537
		}
	}, 'movie');
})();
*/