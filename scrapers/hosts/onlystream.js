const got = require('got');
const json5 = require('json5');
const unpacker = require('../../util/unpacker');

const packedRegex = /(eval\(function\(p,a,c,k,e,d\){.*?}\(.*?\.split\('\|'\)\)\))/;
const jsonRegex = /sources:(\[.*?\])/;

async function scrape(embedURL) {
	const {body} = await got(embedURL);
	
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
	const stream = await scrape('https://onlystream.tv/e/xiensoketsfc');
	console.log(stream);
})();
*/