const got = require('got');
const { JSDOM } = require('jsdom');
const embedScraper = require('../embed');

const URL_BASE = 'http://dwatchseries.to/episode';

async function scrape(traktDetails, type, season, episode) {
	if (type !== 'show') return null;
	
	const url = `${URL_BASE}/${traktDetails.ids.slug.replace(/-/g, '_')}_s${season}_e${episode}.html`;

	const {body} = await got(url);

	const dom = new JSDOM(body);

	const embedList =  [...dom.window.document.querySelectorAll('.watchlink')]
		.map(element => {
			return Buffer.from(element.href.split('r=')[1], 'base64').toString();
		});

	return new Promise(resolve => {
		embedScraper(embedList).then(resolve);
	});
}

module.exports = scrape;

/*
(async () => {
	console.time('scraping');
	const streams = await scrape({
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
	console.timeEnd('scraping');

	console.log(streams);
})();
*/