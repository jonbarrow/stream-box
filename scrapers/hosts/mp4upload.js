const got = require('got');

const REGEX = /\|quot\|\d+\|([a-z1-9]*)\|.*\|video\|([a-z1-9]*)\|(\d+)\|/g;

async function scrape(embedURL) {
	const response = await got(embedURL);
	const body = response.body;

	if (body.includes('This video is no longer available due to a copyright claim') || body.includes('File was deleted')) {
		return null;
	}

	// Some response bodies return `null` when just doing `parts = REGEX.exec(body)`, but WILL work when using this double-REGEX setup
	// It's hacky, and dirty, and I don't like it. But it works.
	const variables = body.match(REGEX);
	const parts = REGEX.exec(variables);

	if (!parts) {
		return null;
	}

	return `https://${parts[1]}.mp4upload.com:${parts[3]}/d/${parts[2]}/video.mp4`;
}

module.exports = {
	scrape
};

/*
(async () => {
	const streams = await scrape('https://www.mp4upload.com/embed-sphls0sk5f8b.html');
	console.log(streams);
})();
*/