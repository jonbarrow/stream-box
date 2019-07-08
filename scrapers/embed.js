process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	// application specific logging, throwing an error, or other logic here
});

const async = require('async');
const parseDomain = require('parse-domain');
const hostScrapers = require('./hosts');

async function scrape(embedList) {
	const streams = [];

	return new Promise(resolve => {
		async.each(embedList, (embed, callback) => {
			try {
				const {domain, tld} = parseDomain(embed);
				const _domain = `${domain}.${tld}`;

				switch (_domain) {
					case 'openload.co':
					case 'openload.io':
					case 'openload.link':
					case 'oload.tv':
					case 'oload.stream':
					case 'oload.site':
					case 'oload.xyz':
					case 'oload.win':
					case 'oload.download':
					case 'oload.cloud':
					case 'oload.cc':
					case 'oload.icu':
					case 'oload.fun':
						hostScrapers.OpenLoad.scrape(embed)
							.then(openload => {
								if (openload) {
									streams.push({
										file_host: 'OpenLoad',
										file: openload
									});
								}

								callback();
							});
						break;

					case 'mp4upload.com':
						hostScrapers.MP4Upload.scrape(embed)
							.then(mp4upload => {
								if (mp4upload) {
									streams.push({
										file_host: 'mp4upload',
										file: mp4upload
									});
								}

								callback();
							});
						break;
					
					case 'streamango.com':
						//  Streamango seems down?
						/*
						hostScrapers.StreaMango.scrape(embed)
							.then(streamango => {
								if (streamango) {
									async.each(streamango, (stream, cb) => {
										got.head(stream.source.replace('//', '')).then(response => {
											streams.push({
												file_host: 'StreaMango',
												file: response.url,
												quality: stream.quality,
											});

											cb();
										});
									}, callback);
								} else {
									callback();
								}
							});
						*/
						callback();
						break;
					case 'verystream.com':
					case 'putlockertv.biz':
						hostScrapers.VeryStream.scrape(embed)
							.then(verystream => {
								if (verystream) {
									streams.push({
										file_host: 'VeryStream',
										file: verystream
									});
								}
								
								callback();
							});
						break;
					case 'gounlimited.to':
						hostScrapers.GoUnlimited.scrape(embed)
							.then(gounlimited => {
								if (gounlimited) {
									for (const stream of gounlimited) {
										streams.push({
											file_host: 'GoUnlimited',
											file: stream
										});
									}
								}
								
								callback();
							});
						break;
					case 'gomostream.com':
					case 'viduplayer.com':
						hostScrapers.ViduPlayer.scrape(embed)
							.then(viduplayer => {
								if (viduplayer) {
									for (const stream of viduplayer) {
										streams.push({
											file_host: 'ViduPlayer',
											file: stream.file,
											quality: stream.label,
										});
									}
								}

								callback();
							});
						break;
					case 'idtbox.com':
						hostScrapers.IDTBox.scrape(embed)
							.then(idtbox => {
								if (idtbox) {
									streams.push({
										file_host: 'IDTBox',
										file: idtbox
									});
								}

								callback();
							});
						break;
					case 'vidoza.net':
						hostScrapers.Vidoza.scrape(embed)
							.then(vidoza => {
								if (vidoza) {
									streams.push({
										file_host: 'Vidoza',
										file: vidoza
									});
								}

								callback();
							});
						break;
					case 'clipwatching.com':
						hostScrapers.ClipWatching.scrape(embed)
							.then(clipwatching => {
								if (clipwatching) {
									for (const stream of clipwatching) {
										streams.push({
											file_host: 'ClipWatching',
											file: stream.file,
											quality: stream.label,
										});
									}
								}

								callback();
							});
						break;
					case 'flix555.com':
						hostScrapers.Flix555.scrape(embed)
							.then(flix555 => {
								if (flix555) {
									for (const stream of flix555) {
										streams.push({
											file_host: 'Flix555',
											file: stream.file,
											quality: stream.label,
										});
									}
								}

								callback();
							});
						break;
					case 'vshare.eu':
						hostScrapers.VShare.scrape(embed)
							.then(vshare => {
								if (vshare) {
									streams.push({
										file_host: 'Vshare',
										file: vshare
									});
								}

								callback();
							});
						break;
					case 'unlimitedpeer.ru':
						hostScrapers.UnlimitedPeer.scrape(embed)
							.then(unlimitedpeer => {
								if (unlimitedpeer) {
									streams.push({
										file_host: 'UnlimitedPeer',
										file: unlimitedpeer
									});
								}

								callback();
							});
						break;
					case 'megaxfer.ru':
						hostScrapers.Megaxfer.scrape(embed)
							.then(megaxfer => {
								if (megaxfer) {
									for (const stream of megaxfer) {
										streams.push({
											file_host: 'Megaxfer',
											file: stream.file
										});
									}
								}

								callback();
							});
						break;
					case 'fembed.com':
						hostScrapers.FEmbed.scrape(embed)
							.then(fembed => {
								if (fembed) {
									for (const stream of fembed) {
										streams.push({
											file_host: 'FEmbed',
											file: stream.file,
											quality: stream.quality,
										});
									}
								}

								callback();
							});
						break;
					case 'vev.io': // captcha
					case 'powvideo.net': // captcha
					case 'gorillavid.in': // dead
					case 'daclips.in': // dead
					case 'movpod.in': // dead
					case 'thevideo.me': // broken site
					case 'streamplay.to': // captcha
					case 'vidcloud.co': // CF, and down
					case 'flashx.tv': // Site seems broken, can't test emebed links
					case 'gamovideo.com': // broken site
					case 'vidtodo.com': // broken site
					case 'vidup.io': // broken site
					case 'vidup.me': // broken site
					case 'vidzi.tv': // cant find working embed to test
					case 'vidto.me': // cant find working embed to test
					case 'vidlox.tv': // cant find working embed to test
					case 'waaw.tv': // captcha
						callback();
						break;
					default:
						console.log('Unknown embed host', embed);
						callback();
						break;
				}	
			} catch (error) {
				console.log(embed);
				callback();
			}
		}, () => {
			return resolve(streams);
		});
	});
}

module.exports = scrape;