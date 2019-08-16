const got = require('got');
const async = require('async');
const { EventEmitter } = require('events');
const embedScraper = require('../embed');

const URL_BASE = 'https://qazwsxedcrfvtgb.info/movie';

const ACCEPTED_EMBED_IDS = [
	2, 4, 7
];

class qazwsxedcrfvtgb extends EventEmitter {
	constructor() {
		super();
	}

	async scrape(traktDetails, type, season, episode) {
		const response = await got(`${URL_BASE}/${traktDetails.ids.imdb}`, {
			json: true
		});

		const data = response.body;

		if (!data.episodes || data.episodes.length <= 0) {
			return this.emit('finished');
		}

		let urls;

		if (type === 'show') {
			urls = data.episodes.find(({season: _s, episode: _e}) => (_s === season && _e === episode));

			if (!urls) {
				return this.emit('finished');
			}
			
			urls = urls.streams;
		} else {
			urls = data.episodes[0].streams;
		}

		async.each(urls, (url, callback) => {
			if (ACCEPTED_EMBED_IDS.includes(url.type)) {
				embedScraper(url.stream)
					.then(streams => {
						if (streams) {
							for (const stream of streams) {
								stream.aggregator = 'qazwsxedcrfvtgb';
								this.emit('stream', stream);
							}
						}

						callback();
					});
			} else {
				callback();
			}
		}, () => {
			this.emit('finished');
		});
	}
}

module.exports = qazwsxedcrfvtgb;