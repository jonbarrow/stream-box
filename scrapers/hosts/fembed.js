const got = require('got');
const async = require('async');

async function scrape(embedURL) {
	const streams = [];
	
	const id = embedURL.split('/').pop();

	const response = await got.post(`https://www.fembed.com/api/source/${id}`, {
		throwHttpErrors: false,
		body: 'r=&d=www.fembed.com'
	});
	
	const body = JSON.parse(response.body);
	const qualities = body.data;

	return new Promise(resolve => {
		if (!body.success || qualities === 'Video not found or has been removed') {
			return resolve();
		}

		async.each(qualities, (quality, callback) => {
			const {file, label} = quality;
			got.head(file, {throwHttpErrors: false}).then(head => {

				if (head.statusCode !== 200) {
					return callback();
				}

				streams.push({
					file: head.url,
					quality: label
				});

				callback();
			});
		}, () => {
			return resolve(streams);
		});
	});
}

/*
(async () => {
	const stream = await scrape('https://www.fembed.com/v/rj538se6e-j0442');
	console.log(stream);
})();
*/

module.exports = {
	scrape
};