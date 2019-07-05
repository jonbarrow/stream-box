const got = require('got');
const json5 = require('json5');

const REGEX = /sources = (\[.*?\])/;

async function scrape(embedURL) {
	const fid = embedURL.split('/')[4];
	const {body} = await got(`https://megaxfer.ru/player?fid=${fid}&page=embed`, {json: true});
	const {html} = body;

	const regexData = REGEX.exec(html);
	if (!regexData || !regexData[1]) {
		return null;
	}

	return json5.parse(regexData[1]);
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://megaxfer.ru/embed/5cee52cdb9521/Captain.Marvel.2019.1080p.WEBRip.x264-RARBG.mp4?v=1#');
	console.log(stream);
})();
*/