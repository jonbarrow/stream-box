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

	async scrape(traktDetails) {
		const response = await got(`${URL_BASE}/${traktDetails.ids.imdb}`, {
			json: true
		});

		const data = response.body;

		if (!data.episodes || data.episodes.length <= 0) {
			return this.emit('finished');
		}

		const urls = data.episodes[0].streams;

		async.each(urls, (url, callback) => {
			if (ACCEPTED_EMBED_IDS.includes(url.type)) {
				embedScraper(url.stream)
					.then(streams => {
						if (streams) {
							for (const stream of streams) {
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