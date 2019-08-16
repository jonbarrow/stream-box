const { EventEmitter } = require('events');
const got = require('got');
const querystring = require('querystring');
const async = require('async');
const { JSDOM } = require('jsdom');
const embedScraper = require('../embed');

const URL_BASE = 'https://api.putlockertv.biz';

const AJAX = `${URL_BASE}/wp-admin/admin-ajax.php`;

const movieIdRegex = /movie-id="(\d*?)"/;
const sourceRegex = /src='(.*?)'/;

class PutLockerTv extends EventEmitter {
	constructor() {
		super();
	}

	async scrape(traktDetails, type, season, episode) {
		let url;
		if (type === 'show') {
			url = `${URL_BASE}/${traktDetails.ids.tmdb}-s${season}-e${episode}`;
		} else {
			url = `${URL_BASE}/film/${traktDetails.ids.imdb}`;
		}
	
		let response = await got(url, {
			throwHttpErrors: false
		});
		const body = response.body;
	
		const movieIdData = movieIdRegex.exec(body);
	
		if (!movieIdData || !movieIdData[1]) {
			return this.emit('finished');
		}
	
		const movieID = movieIdData[1];
	
		response = await got.post(`${AJAX}`, {
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body: querystring.stringify({
				action: 'lazy_player',
				movieID
			})
		});
	
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
								stream.aggregator = 'putlockertv';
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

module.exports = PutLockerTv;

/*
(async () => {
	const scraper = new PutLockerTv();

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

/*
(async () => {
	const scraper = new PutLockerTv();

	scraper.on('stream', stream => {
		console.log(stream);
	});

	scraper.on('finished', () => {
		console.timeEnd('scraping');
	});
	
	console.time('scraping');
	scraper.scrape({
		title: 'House',
		year: 2004,
		ids: {
			trakt: 1399,
			slug: 'house',
			tvdb: 73255,
			imdb: 'tt0412142',
			tmdb: 1408,
			tvrage: 3908
		}
	}, 'show', 1, 1);
})();
*/