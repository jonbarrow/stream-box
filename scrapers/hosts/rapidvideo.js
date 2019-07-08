const got = require('got');
const { JSDOM } = require('jsdom');

async function scrape(embedURL) {

	const response = await got(embedURL, {
		throwHttpErrors: false, // Turns off throwing exceptions for non-2xx HTTP codes
		headers: {
			Referer: embedURL
		}
	});
	const body = response.body;

	// Dirty check to see if the file exists
	if (
		body.includes('We can\'t find the file you are looking for.') ||
		body.includes('Action not permitted')
	) {
		return null;
	}

	const dom = new JSDOM(body);
	const sources = [...dom.window.document.querySelectorAll('source')]
		.map(element => ({
			file: element.src,
			quality: element.getAttribute('label')
		}));

	return sources;
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://www.rapidvideo.com/e/G3NURA6K6C');
	console.log(stream);
})();
*/