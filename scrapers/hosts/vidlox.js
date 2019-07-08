const got = require('got');
const JSON5 = require('json5');

const sourcesRegex = /sources:.*?(\[.*?\])/;

async function scrape(embedURL) {
	const {body} = await got(embedURL);

	let sources = sourcesRegex.exec(body);
	if (sources && sources[1]) {
		sources = JSON5.parse(sources[1]);
	}

	return sources;
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://vidlox.me/embed-b1i7sp68nuly');
	console.log(stream);
})();
*/