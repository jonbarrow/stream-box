const { EventEmitter } = require('events');
const got = require('got');
const async = require('async');
const { JSDOM } = require('jsdom');
const embedScraper = require('../embed');

const URL_BASE = 'https://f2movies.to';
const URL_SEARCH = `${URL_BASE}/search`;

const AJAX_BASE = `${URL_BASE}/ajax`;
const AJAX_EPISODES = `${AJAX_BASE}/v4_movie_episodes`;
const AJAX_SOURCES = `${AJAX_BASE}/movie_sources`;
const AJAX_EMBED = `${AJAX_BASE}/movie_embed`;

class F2Movies extends EventEmitter {
	constructor() {
		super();
	}

	async scrape({title}, type) {
		if (type !== 'movie') {
			return this.emit('finished');
		}

		let response = await got(`${URL_SEARCH}/${escape(title).replace(/%20/g, '+')}`);
		const searchResults = response.body;
		let dom = new JSDOM(searchResults);

		const movie = [...dom.window.document.querySelectorAll('.flw-item')]
			.map(element => {
				const dataUrl = element.querySelector('.flw-item-tip').dataset.url.split('/');
				return {
					name: element.querySelector('.film-name a').innerHTML,
					id: dataUrl[2],
					movie_id: dataUrl[3]
				};
			})
			.find(({name}) => name === title);

		if (!movie) {
			return this.emit('finished');
		}

		response = await got(`${AJAX_EPISODES}/${movie.id}/${movie.movie_id}`, {
			json: true
		});
		const {html} = response.body;
		dom = new JSDOM(html);

		const episodeDataList = [...dom.window.document.querySelectorAll('.nav-item')]
			.map(element => ({
				server: element.dataset.server,
				id: element.dataset.id,
				type: element.getAttribute('onclick').match(/'(\w*?)'/)[1]
			}));
		
		async.each(episodeDataList, ({server, id, type}, callback) => {
			let url;
			
			if (type === 'direct') {
				url = `${AJAX_SOURCES}/${id}-${server}`;
			} else if (type === 'embed') {
				url = `${AJAX_EMBED}/${id}-${server}`;
			}

			if (!url) {
				return callback();
			}

			got(url, {json: true})
				.then(({body}) => {

					if (type === 'direct') {
						if (body && body.playlist) {
							for (const playlist of body.playlist) {
								for (const source of playlist.sources) {
									this.emit('stream', {
										aggregator: 'f2movies',
										file_host: 'Google Video', // Seems to always be Google Video?
										file: source.file,
										quality: source.label,
									});
								}
							}
						}

						callback();
					} else if (type === 'embed') {
						embedScraper(body.src)
							.then(streams => {
								if (streams) {
									for (const stream of streams) {
										stream.aggregator = 'f2movies';
										this.emit('stream', stream);
									}
								}

								callback();
							});
					}
				});
		}, () => {
			this.emit('finished');
		});
	}
}
module.exports = F2Movies;

/*
(async () => {
	const scraper = new F2Movies();

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