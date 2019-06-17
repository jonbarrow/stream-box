const got = require('got');
const async = require('async');
const hostScrapers = require('../hosts');
const VidStreaming = require('../hosts/vidstreaming');
//const {helpers} = require('../../util');

const URL_BASE = 'http://104.196.45.69/api/search';

async function scrape(traktDetails) {
	let streams = [];

	const response = await got(`${URL_BASE}?query=${traktDetails.title}`, {
		json: true
	});

	const data = response.body;

	if (
		!data.status ||
		data.status !== 'successful' ||
		!data.payload ||
		!data.payload.data ||
		data.payload.data.length <= 0
	) {
		return null;
	}

	const movies = data.payload.data;
	const movie = movies.find(({title}) => title === traktDetails.title);

	if (!movie) {
		return null;
	}

	const link = movie.links[0].url;

	VidStreaming.scrape(link)
		.then(vidstreaming => {
			if (vidstreaming) {
				console.log(vidstreaming);
			}

			//callback();
		});

	/*

	return console.log(link);

	const urls = data.episodes[0].streams;

	return new Promise(resolve => {
		async.each(urls, (url, callback) => {
		}, () => {
			return resolve(streams);
		});
	});
	*/
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