const got = require('got');

const REGEX = /<source src="(.*?)"/g;

async function scrape(embedURL) {

	if (!embedURL.includes('embed-')) {
		const id = embedURL.split('/').pop();

		embedURL = `http://vidoza.net/embed-${id}`;
		embedURL = (embedURL.endsWith('.html') ? embedURL : `${embedURL}.html`);
	}

	const {body} = await got(embedURL);
	
	if (body === 'File was deleted') {
		return null;
	}

	const regexData = REGEX.exec(body);
	if (!regexData || !regexData[1]) {
		return null;
	}

	return regexData[1];
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://vidoza.net/embed-v2s2m5u4pu0h.html');
	console.log(stream);
})();
*/