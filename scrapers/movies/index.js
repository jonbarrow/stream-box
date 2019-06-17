const async = require('async'); // asynchronous utils

const scrapers = require('./scrapers'); // all anime scapers
const {helpers, trakt} = require('../../util'); // util functions

async function getStreams(id) {
	let streams = []; // All streams will end up in here, this will be returned

	const details = await trakt.movieDetails(id);

	// Return a promise so that we can `await` this function
	return new Promise(resolve => {
		// Loop over every scraper in parallel
		async.each(scrapers, (scraper, callback) => {
			// Start the async scraping process
			scraper(details)
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

module.exports = getStreams; // Export the function

// Tesing
(async () => {
	console.time('Scrape Time');
	const streams = await getStreams('tt4154756');
	console.timeEnd('Scrape Time');
	console.log(`Scrapers: ${Object.keys(scrapers).length}`);
	console.log(`Total streams: ${streams.length}`);
	console.log(streams);
})();