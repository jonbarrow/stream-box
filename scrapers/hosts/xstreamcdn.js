const got = require('got');
const async = require('async');

async function scrape(embedURL) {
	const streams = [];
	
	const id = embedURL.split('/').pop();

	const response = await got.post(`https://xstreamcdn.com/api/source/${id}`, {
		throwHttpErrors: false,
		body: 'r=&d=xstreamcdn.com'
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
// https://xstreamcdn.com/v/eno8pqer0v1
// https://xstreamcdn.com/v/1x9qyz2mxo4
(async () => {
	const stream = await scrape('https://xstreamcdn.com/v/1x9qyz2mxo4');
	console.log(stream);
})();
*/

module.exports = {
	scrape
};