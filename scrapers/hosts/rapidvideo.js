const got = require('got');
const async = require('async'); // asynchronous utils
const { JSDOM } = require('jsdom');

async function scrape(embedURL) {
	return null; // Disable rapidvideo cuz of premium user shit
	
	// Get the webpage
	const response = await got(embedURL, {
		throwHttpErrors: false, // Turns off throwing exceptions for non-2xx HTTP codes
		headers: {
			Referer: embedURL
		}
	});
	const body = response.body;

	// Dirty check to see if the file exists
	if (body.includes('We can\'t find the file you are looking for.')) {
		return null;
	}

	return parse(body);
}

async function parse(body) {
	const streams = [];
	const dom = new JSDOM(body);
	const qualities = [...dom.window.document.querySelectorAll('a')]
		.filter(el => {
			return el.href.includes('rapidvideo.com/e/');
		});

	return new Promise(resolve => {
		async.each(qualities, (quality, callback) => {
			const qualityURL = quality.href;
			got(qualityURL, {
				headers: {
					Referer: qualityURL
				}
			}).then(response => {
				const body = response.body;
		
				const dom = new JSDOM(body);
				const source = dom.window.document.querySelector('source').src;

				streams.push({
					source,
					quality: qualityURL.split('q=')[1] // RapidVideo uses a weird way of param separation
				});

				callback();
			});
		}, () => {
			return resolve(streams);
		});
	});
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://www.rapidvideo.com/e/FU1U6HII73');
	console.log(stream);
})();
*/