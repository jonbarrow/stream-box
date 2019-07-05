const got = require('got');

const REGEX = /<source src="(.*?)"/g;

async function scrape(embedURL) {
	if (!embedURL.includes('embed-')) {
		const id = embedURL.split('/').pop();

		embedURL = `https://idtbox.com/embed-${id}.html`;
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
	const stream = await scrape('https://idtbox.com/embed-fm3w4utwjwjh.html');
	console.log(stream);
})();
*/