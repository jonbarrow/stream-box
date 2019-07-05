const got = require('got');

const REGEX = /<p style="" class="" id="videolink">(.*?)<\/p>/g;

async function scrape(embedURL) {
	const {body} = await got(embedURL);
	const regexData = REGEX.exec(body);
	
	if (!regexData || !regexData[1]) {
		return null;
	}

	const token = regexData[1];
	const {url} = await got.head(`https://verystream.com/gettoken/${token}?mime=true`);

	return url;
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://verystream.com/e/butmYPdd4Pd');
	console.log(stream);
})();
*/