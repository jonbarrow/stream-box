const got = require('got');
const embedScraper = require('../embed');

const URL_BASE = 'https://gomostream.com';
const URL_DECODING = `${URL_BASE}/decoding_v3.php`;

const tokenCodeRegex = /var tc = '(.*?)'/;
const tokenCodeOffsetsRegex = /slice\((\d*,\d*)\)/;
const tokenCodeSuffixRegex = /("\d*"\+"\d*")/;
const _tokenRegex = /"_token": "(.*?)"/;

async function scrape(traktDetails, type, season, episode) {
	let url = `${URL_BASE}/${type}/${traktDetails.ids.imdb}`;
	url = (type === 'show' ? `${url}/${String(season).padStart(2, '0')}-${String(episode).padStart(2, '0')}` : url);

	const {body: pageBody} = await got(url);

	const tokenCodeData = tokenCodeRegex.exec(pageBody);
	const tokenCodeOffsetsData = tokenCodeOffsetsRegex.exec(pageBody);
	const tokenCodeSuffixData = tokenCodeSuffixRegex.exec(pageBody);
	const _tokenData = _tokenRegex.exec(pageBody);

	if (!tokenCodeData || !tokenCodeOffsetsData || !tokenCodeSuffixData || !_tokenData) {
		return null;
	}

	const tokenCode = tokenCodeData[1];
	const tokenCodeOffsets = tokenCodeOffsetsData[1].split(',');
	const tokenCodeSuffix = eval(tokenCodeSuffixData[1]);
	const _token = _tokenData[1];
	const xToken = tokenCode.slice(tokenCodeOffsets[0], tokenCodeOffsets[1]).split('').reverse().join('') + tokenCodeSuffix;

	const {body: streamBody} = await got.post(URL_DECODING, {
		headers: {
			'x-token': xToken,
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
		},
		body: `tokenCode=${tokenCode}&_token=${_token}`
	});

	const embedList = JSON.parse(streamBody)
		.filter(embed => embed.trim() !== '');

	return embedScraper(embedList);
}

module.exports = scrape;

/*
(async () => {
	console.time('scraping');
	const streams = await scrape({
		title: 'House',
		year: 2004,
		ids: {
			trakt: 1399,
			slug: 'house',
			tvdb: 73255,
			imdb: 'tt0412142',
			tmdb: 1408,
			tvrage: 3908
		}
	}, 'show', 1, 1);
	console.timeEnd('scraping');

	console.log(streams);
})();
*/