const got = require('got');
const json5 = require('json5');
const unpacker = require('../../util/unpacker');

const packedRegex = /(eval\(function\(p,a,c,k,e,d\){.*?}\(.*?\.split\('\|'\)\)\))/;
const jsonRegex = /sources:(\[.*?\])/;

async function scrape(embedURL) {
	const response = await got(embedURL);
	const body = response.body;

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
	const streams = await scrape('https://viduplayer.com/embed-rv3slqsvdfao.html');
	console.log(streams);
})();
*/