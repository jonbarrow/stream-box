const got = require('got');

const REGEX = /<source src="(.*?)"/g;

async function scrape(embedURL) {
	if (!embedURL.includes('embed-')) {
		const id = embedURL.split('/').pop();

		embedURL = `https://vshare.eu/embed-${id}`;
		embedURL = (embedURL.endsWith('.htm') ? `${embedURL}l` : `${embedURL}.html`);
	}
	const {body} = await got(embedURL);
	
	if (body.includes('The file you were looking for could not be found, sorry for any inconvenience')) {
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
	const stream = await scrape('https://vshare.eu/lr7trfthct32.htm');
	console.log(stream);
})();
*/