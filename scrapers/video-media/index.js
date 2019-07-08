const async = require('async'); // asynchronous utils

const scrapers = require('./scrapers'); // all anime scapers
const {helpers, trakt} = require('../../util'); // util functions

async function getStreams(id, season=1, episode=1) {
	let streams = []; // All streams will end up in here, this will be returned
	let details;
	let type;

	try {
		details = await trakt.movieDetails(id);
		type = 'movie';
	} catch(e) {
		try {
			details = await trakt.showDetails(id);
			type = 'show';
		} catch (e) {
			return streams;
		}
	}

	// Return a promise so that we can `await` this function
	return new Promise(resolve => {
		// Loop over every scraper in parallel
		async.each(scrapers, (scraper, callback) => {
			// Start the async scraping process
			scraper(details, type, season, episode)
				.then(scrapedStreams => {
					// Merge the returned streams with the master list
					if (scrapedStreams) {
						streams = helpers.mergeArrays(streams, scrapedStreams);
					}
					callback();
				})
				.catch(() => { // Silently ignore errors for now
					callback();
				});
		}, () => {
			// Resolve the promise to return the streams
			return resolve(streams);
		});
	});
}

module.exports = getStreams;

/*
// Tesing
(async () => {
	console.time('Scrape Time');
	const streams = await getStreams('tt4154664');
	console.timeEnd('Scrape Time');
	console.log(`Scrapers: ${Object.keys(scrapers).length}`);
	console.log(`Total streams: ${streams.length}`);
	//console.log(streams);
})();
*/