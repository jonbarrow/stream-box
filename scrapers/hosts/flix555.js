const got = require('got');
const json5 = require('json5');
const unpacker = require('../../util/unpacker');

const packedRegex = /(eval\(function\(p,a,c,k,e,d\){.*?}\(.*?\.split\('\|'\)\)\))/;
const jsonRegex = /sources:(\[.*?\])/;

async function scrape(embedURL) {
	if (!embedURL.includes('embed-')) {
		const id = embedURL.split('/').pop();

		embedURL = `https://flix555.com/embed-${id}.html`;
	}

	const {body} = await got(embedURL);
	
	if (body.includes('File is no longer available as it expired or has been deleted')) {
		return null;
	}

	const packed = packedRegex.exec(body)[1];
	const unpacked = unpacker.unPack(packed);

	const sources = jsonRegex.exec(unpacked);
	const parsed = json5.parse(sources[1]);

	return parsed;
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://flix555.com/mcpn98g0pqzw');
	console.log(stream);
})();
*/