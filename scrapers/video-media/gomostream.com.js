const { EventEmitter } = require('events');
const got = require('got');
const async = require('async');
const embedScraper = require('../embed');

const URL_BASE = 'https://gomostream.com';
const URL_DECODING = `${URL_BASE}/decoding_v3.php`;

const tokenCodeRegex = /var tc = '(.*?)'/;
const tokenCodeOffsetsRegex = /slice\((\d*,\d*)\)/;
const tokenCodeSuffixRegex = /("\d*"\+"\d*")/;
const _tokenRegex = /"_token": "(.*?)"/;

class GomoStream extends EventEmitter {
	constructor() {
		super();
	}

	async scrape(traktDetails, type, season, episode) {
		let url = `${URL_BASE}/${type}/${traktDetails.ids.imdb}`;
		url = (type === 'show' ? `${url}/${String(season).padStart(2, '0')}-${String(episode).padStart(2, '0')}` : url);
	
		const {body: pageBody} = await got(url);
	
		const tokenCodeData = tokenCodeRegex.exec(pageBody);
		const tokenCodeOffsetsData = tokenCodeOffsetsRegex.exec(pageBody);
		const tokenCodeSuffixData = tokenCodeSuffixRegex.exec(pageBody);
		const _tokenData = _tokenRegex.exec(pageBody);
	
		if (!tokenCodeData || !tokenCodeOffsetsData || !tokenCodeSuffixData || !_tokenData) {
			return this.emit('finished');
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
	
		async.each(embedList, (embed, callback) => {
			embedScraper(embed)
				.then(streams => {
					if (streams) {
						for (const stream of streams) {
							stream.aggregator = 'gomostream';
							this.emit('stream', stream);
						}
					}

					callback();
				});
		}, () => {
			this.emit('finished');
		});
	}
}

module.exports = GomoStream;

/*
(async () => {
	const scraper = new GomoStream();

	scraper.on('stream', stream => {
		console.log(stream);
	});

	scraper.on('finished', () => {
		console.timeEnd('scraping');
	});
	
	console.time('scraping');
	scraper.scrape({
		title: 'Captain Marvel',
		year: 2019,
		ids: {
			trakt: 193963,
			slug: 'captain-marvel-2019',
			imdb: 'tt4154664',
			tmdb: 299537
		}
	}, 'movie');
})();
*/