/*
	This one works but can be unreliable,
	because after a few requests they start hitting you with a ratelimit and captcha
*/

const got = require('got');
const { EventEmitter } = require('events');

const URL_BASE = 'https://consistent.stream';
const URL_TITLES = `${URL_BASE}/titles`;

const hashRegex = /hash="(.+?)"/;
const expireRegex = /expire="(.+?)"/;

class ConsistentStream extends EventEmitter {
	constructor() {
		super();
	}

	async scrape(traktDetails, type) {
		if (type !== 'movie') {
			return this.emit('finished');
		}
	
		const year = traktDetails.year;
		let slug = traktDetails.ids.slug;
		slug = (slug.endsWith(year) ? slug.split('-').slice(0, -1).join('-') : slug);
	
		let response = await got(`${URL_TITLES}/${slug}`, {
			headers: {
				Referer: `http://vexmovies.org/${slug}`
			}
		});
	
		const html = response.body;
	
		const hash = html.match(hashRegex)[1];
		const expire = html.match(expireRegex)[1];
	
		response = await got.post('https://consistent.stream/api/getVideo', {
			json: true,
			headers: {
				Referer: `${URL_TITLES}/${slug}`
			},
			body: {
				video: slug,
				referrer: `http://vexmovies.org/${slug}`,
				key: hash,
				expire: expire
			}
		});
	
		const servers = response.body.servers;
	
		for (const server of servers) {
			if (server.uses == 'jw') {
				for (const stream of server.sources) {
					this.emit('stream', {
						aggregator: 'Consistent Stream',
						file_host: 'Consistent Stream',
						file: stream.src,
						m3u8: stream.src.includes('api.consistent.stream')
					});
				}
			}
		}
	
		this.emit('finished');
	}
}

module.exports = ConsistentStream;


/*
(async () => {
	const scraper = new ConsistentStream();

	scraper.on('stream', stream => {
		console.log(stream);
	});

	scraper.on('finished', () => {
		console.timeEnd('scraping');
	});
	
	console.time('scraping');
	scraper.scrape({
		year: 2018,
		ids: {
			slug: 'deadpool-2-2018'
		}
	}, 'movie');
})();
*/