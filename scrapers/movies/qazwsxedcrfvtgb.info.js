const got = require('got');
const async = require('async');
const hostScrapers = require('../hosts');
//const {helpers} = require('../../util');

const URL_BASE = 'https://qazwsxedcrfvtgb.info/movie';

async function scrape(traktDetails) {
	let streams = [];

	const response = await got(`${URL_BASE}/${traktDetails.ids.imdb}`, {
		json: true
	});

	const data = response.body;

	if (!data.episodes || data.episodes.length <= 0) {
		return null;
	}

	const urls = data.episodes[0].streams;

	return new Promise(resolve => {
		async.each(urls, (url, callback) => {
			got.head(url.stream, {throwHttpErrors: false}).then(({statusCode}) => {
				console.log(statusCode);
				callback();
			}).catch(error => {
				// handle error
				console.log(url.stream, error);
				callback();
			});

			/*
			switch (url.type) {
				case 4:
					console.log('DDD');
					hostScrapers.StreaMango.scrape(url.stream)
						.then(streamango => {
							if (streamango) {
								console.log(streamango);
							}

							callback();
						});
					break;
			
				default:
					console.log('Unsupported url', url.type, url.stream);
					callback();
					break;
			}
			*/
		}, () => {
			return resolve(streams);
		});
	});
}

/*
(async () => {
	const streams = await scrape({ // Fake Kitsu response
		attributes: {
			slug: 'tensei-shitara-slime-datta-ken'
		}
	}, 3);

	console.log(streams);
})();
*/

module.exports = scrape;