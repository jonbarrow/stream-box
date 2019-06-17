const got = require('got');

async function scrape(embedURL) {
	const streams = [];
	
	const id = embedURL.split('/').pop();

	const response = await got.post(`https://vev.io/api/serve/video/${id}`, {
		headers: {
			Referer: `https://vev.io/${id}`,
			referer: `https://vev.io/${id}`
		},
		body: {},
		json: true
	});
	const body = response.body;

	const qualities = body.qualities;
	const labels = Object.keys(qualities);

	for (const label of labels) {
		streams.push({
			file: qualities[label],
			quality: label
		});
	}

	return streams;
}

/*
(async () => {
	const stream = await scrape('https://vev.io/embed/zl32d7d771ov');
	console.log(stream);
})();
*/

module.exports = {
	scrape
};