const mediaScraper = require('./scrapers')['video-media'];
const {argv} = process;
const [id, season, episode] = argv.slice(2);

mediaScraper(id, season, episode)
	.then(streams => {
		process.send(streams);
	});