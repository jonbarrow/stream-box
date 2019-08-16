const { EventEmitter } = require('events');
const got = require('got');
const { JSDOM } = require('jsdom');
const async = require('async');
const querystring = require('querystring');
const embedScraper = require('../embed');

const URL_BASE = 'https://124movies.to';
const URL_SEARCH = `${URL_BASE}/wp-json/dooplay/search`;

const AJAX = `${URL_BASE}/wp-admin/admin-ajax.php`;

const nonceRegex = /"nonce":"(.*?)"/;
const sourceRegex = /src='(.*?)'/;

class OneTwoFourMovies extends EventEmitter {
	constructor() {
		super();
	}

	async scrape({title}, type) {
		if (type !== 'movie') {
			return this.emit('finished');
		}

		let response = await got(URL_BASE);
		const homePage = response.body;
	
		const nonceData = nonceRegex.exec(homePage);
		if (!nonceData || !nonceData[1]) {
			return this.emit('finished');
		}
	
		const nonce = nonceData[1];
	
		response = await got(`${URL_SEARCH}?keyword=${title}&nonce=${nonce}`, { json: true });
		const searchResults = response.body;
		
		let movie;
		for (const id in searchResults) {
			const _movie = searchResults[id];
			
			if (_movie.title === title) {
				movie = _movie;
				break;
			}
		}
	
		if (!movie) {
			return this.emit('finished');
		}
	
		const {url} = movie;
	
		response = await got(url);
		const dom = new JSDOM(response.body);
	
		const embedIdList =  [...dom.window.document.querySelectorAll('.dooplay_player_option')]
			.map(element => element.dataset)
			.filter(embed => (embed.post !== 'vs' && embed.nume !== 'trailer')); // "vs" links are special, I will write separate scrapers for them
	
		async.each(embedIdList, ({post, nume, type}, callback) => {
			got.post(`${AJAX}`, {
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				body: querystring.stringify({
					action: 'doo_player_ajax',
					post,
					nume,
					type
				})
			}).then(({body}) => {
				const embed = sourceRegex.exec(body)[1];
				embedScraper(embed)
					.then(streams => {
						if (streams) {
							for (const stream of streams) {
								stream.aggregator = '124movies';
								this.emit('stream', stream);
							}
						}

						callback();
					});
			});
		}, () => {
			this.emit('finished');
		});
	}
}

module.exports = OneTwoFourMovies;

/*
(async () => {
	const scraper = new OneTwoFourMovies();

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