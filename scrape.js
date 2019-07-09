const VideoMediaScraper = require('./scrapers/video-media');
const {argv} = process;
const [id, season, episode] = argv.slice(2);

const scraper = new VideoMediaScraper();

scraper.on('stream', stream => {
	process.send({
		event: 'stream',
		data: stream
	});
});

scraper.on('finished', () => {
	process.send({
		event: 'finished'
	});
});

scraper.scrape(id, season, episode);