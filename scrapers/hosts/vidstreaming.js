const got = require('got');
const async = require('async');
const { JSDOM } = require('jsdom');
const JSON5 = require('json5');
const hostScrapers = require('../hosts');

const SOURCES_REGEX = /sources:(\[.*?\])/;

async function scrape(embedURL) {
	embedURL = (embedURL.startsWith('//') ? embedURL.replace('//', '') : embedURL);
	const streams = [];

	const response = await got(embedURL);
	const body = response.body;
	const dom = new JSDOM(body);

	let sources = SOURCES_REGEX.exec(body);
	if (sources && sources[1]) {
		sources = JSON5.parse(sources[1]);
		await new Promise(resolve => {
			async.each(sources, (source, callback) => {
				got.head(source.file).then(head => {
					if (head.statusCode === 200) {
						streams.push({
							file: head.url,
							quality: source.label.replace(' ', '').toLowerCase(),
						});
					}

					callback();
				});
			}, () => {
				resolve();
			});
		});
	}

	const servers = [...dom.window.document.querySelectorAll('li.linkserver')]
		.map(element => ({
			playerType: element.innerHTML.toLowerCase(),
			embedUrl: element.dataset.video
		}));

	return new Promise(resolve => {
		async.each(servers, (server, callback) => {
			const {playerType, embedUrl} = server;
			if (!embedUrl || embedURL.trim() === '') {
				return callback();
			}
			
			switch (playerType) {
				/*case 'thevideo':
					hostScrapers.Vev.scrape(embedUrl)
						.then(vev => {
							if (vev) {
								for (const stream of vev) {
									streams.push({
										file: stream.file,
										quality: stream.quality,
									});
								}
							}

							callback();
						});
					break;*/
				case 'xstreamcdn':
					hostScrapers.XStreamCDN.scrape(embedUrl)
						.then(xstreamcdn => {
							if (xstreamcdn) {
								for (const stream of xstreamcdn) {
									streams.push({
										file: stream.file,
										quality: stream.quality,
									});
								}
							}

							callback();
						});
					break;
				case 'yourupload':
					hostScrapers.YourUpload.scrape(embedUrl)
						.then(yourupload => {
							if (yourupload) {
								streams.push({
									file: yourupload
								});
							}

							callback();
						});
					break;
				case 'mp4upload':
					hostScrapers.MP4Upload.scrape(embedUrl)
						.then(mp4upload => {
							if (mp4upload) {
								streams.push({
									file: mp4upload
								});
							}

							callback();
						});
					break;

				case 'openload':
				case 'oload':
					hostScrapers.OpenLoad.scrape(embedUrl)
						.then(openload => {
							if (openload) {
								got.head(openload)
									.then(head => {
										streams.push({
											file: head.url
										});

										callback();
									});
							} else {
								callback();
							}
						});
					break;

				case 'streamango':
					hostScrapers.StreaMango.scrape(embedUrl)
						.then(streamango => {
							if (streamango) {
								async.each(streamango, (stream, cb) => {
									got.head(stream.source.replace('//', '')).then(response => {
										streams.push({
											file: response.url,
											quality: stream.quality
										});

										cb();
									});
								}, callback);
							} else {
								callback();
							}
						});
					break;

				case 'rapidvideo':
					hostScrapers.RapidVideo.scrape(embedUrl)
						.then(rapidvideo => {
							if (rapidvideo) {
								for (const stream of rapidvideo) {
									streams.push({
										file: stream.source,
										quality: stream.quality
									});
								}
							}

							callback();
						});
					break;
			
				default:
					callback();
					break;
			}
		}, () => {
			return resolve(streams);
		});
	});
}

/*
(async () => {
	const stream = await scrape('//vidstreaming.io/streaming.php?id=OTU2MTI=&title=Kobayashi-san+Chi+no+Maid+Dragon+%28DUB%29+episode+1&typesub=DUB');
	console.log(stream);
})();
*/

module.exports = {
	scrape
};