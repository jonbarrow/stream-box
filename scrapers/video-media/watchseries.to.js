const { EventEmitter } = require('events');
const got = require('got');
const { JSDOM } = require('jsdom');
const async = require('async');
const embedScraper = require('../embed');

const URL_BASE = 'http://dwatchseries.to/episode';

class WatchSeries extends EventEmitter {
	constructor() {
		super();
	}

	async scrape(traktDetails, type, season, episode) {
		if (type !== 'show') {
			return this.emit('finished');
		}

		const url = `${URL_BASE}/${traktDetails.ids.slug.replace(/-/g, '_')}_s${season}_e${episode}.html`;

		const {body} = await got(url, {throwHttpErrors: false});

		const dom = new JSDOM(body);

		const embedList =  [...dom.window.document.querySelectorAll('.watchlink')]
			.map(element => {
				return Buffer.from(element.href.split('r=')[1], 'base64').toString();
			});

		async.each(embedList, (embed, callback) => {
			embedScraper(embed)
				.then(streams => {
					if (streams) {
						for (const stream of streams) {
							stream.aggregator = 'watchseries';
							this.emit('stream', stream);
						}
					}

					callback();
				});
		}, () => {
			this.emit('finished');
		});
	}
}

module.exports = WatchSeries;

/*
(async () => {
	const scraper = new WatchSeries();

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