process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const async = require('async'); // asynchronous utils
const { EventEmitter } = require('events');

const scrapers = require('./scrapers'); // all anime scapers
const {trakt} = require('../../util'); // util functions

class VideoMediaScraper extends EventEmitter {
	constructor() {
		super();
	}

	async scrape(id, season, episode) {
		let details;
		let type;

		if (season && episode) {
			details = await trakt.showDetails(id);
			type = 'show';
		} else {
			details = await trakt.movieDetails(id);
			type = 'movie';
		}

		async.each(scrapers, (Scraper, callback) => {
			const scraper = new Scraper();

			scraper.on('stream', stream => {
				this.emit('stream', stream);
			});

			scraper.on('finished', callback);

			scraper.scrape(details, type, season, episode);
		}, () => {
			this.emit('finished');
		});
	}
}

module.exports = VideoMediaScraper;

/*
// Tesing
(async () => {
	const streams = [];
	const scraper = new VideoMediaScraper();

	scraper.on('stream', stream => {
		streams.push(stream);
		console.log(stream);
	});

	scraper.on('finished', () => {
		console.timeEnd('Scrape Time');
		console.log(`Scrapers: ${Object.keys(scrapers).length}`);
		console.log(`Total streams: ${streams.length}`);
		console.log(streams);
	});
	
	console.log('Starting House scraping');
	console.time('Scrape Time');
	scraper.scrape('tt0412142', 6, 8);
})();
*/

/*
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