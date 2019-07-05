const got = require('got');
const json5 = require('json5');
const unpacker = require('../../util/unpacker');

const packedRegex = /(eval\(function\(p,a,c,k,e,d\){.*?}\(.*?\.split\('\|'\)\)\))/;
const jsonRegex = /sources:(\[.*?\])/;

async function scrape(embedURL) {
	const response = await got(embedURL);
	const body = response.body;

	if (body.includes('The file you were looking for could not be found, sorry for any inconvenience')) {
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
	const streams = await scrape('http://clipwatching.com/i7cjdftj4bn0/seth.meyers.2019.06.20.aubrey.plaza.web.x264-tbs.mkv.html');
	console.log(streams);
})();
*/