const got = require('got');
const { JSDOM } = require('jsdom');

const URL_BASE = 'https://hdonline.eu';
const URL_MOVIE = `${URL_BASE}/movie`;

async function scrape(traktDetails, type) {
	if (type === 'movie') {
		return scrapeMovie(traktDetails);
	} else {
		// Add show support
		return null;
	}
}

async function scrapeMovie({ids: {slug}}) {
	const {body} = await got(`${URL_MOVIE}/${slug}`);
	const dom = new JSDOM(body);

	const serverList = dom.window.document.getElementById('server_list');
	console.log(serverList);

	/*
	const searchResults = response.body;
	let dom = new JSDOM(searchResults);

	const movieObject = [...dom.window.document.querySelectorAll('.flw-item')]
		.map(element => {
			const dataUrl = element.querySelector('.flw-item-tip').dataset.url.split('/');
			return {
				name: element.querySelector('.film-name a').innerHTML,
				id: dataUrl[2],
				movie_id: dataUrl[3]
			};
		})
		.find(({name}) => name === title);
	
	if (!movieObject) {
		return null;
	}

	response = await got(`${AJAX_EPISODES}/${movieObject.id}/${movieObject.movie_id}`, {
		json: true
	});
	const {html} = response.body;
	dom = new JSDOM(html);

	const episodeDataList = [...dom.window.document.querySelectorAll('.nav-item')]
		.map(element => ({
			server: element.dataset.server,
			id: element.dataset.id
		}));

	const embedList = [];
	
	await new Promise(resolve => {
		async.each(episodeDataList, ({server, id}, callback) => {
			// There seems to be direct streams but I ignore those here cuz they don't actually seem to have sources
			let url;
			switch (server) { // All these are embeds
				case '16':
				case '33':
				case '34':
					url = `${AJAX_EMBED}/${id}-${server}`;
					break;
			}

			if (!url) {
				return callback();
			}

			got(url, {json: true})
				.then(({body}) => {
					embedList.push(body.src);
					callback();
				});
		}, resolve);
	});

	return new Promise(resolve => {
		embedScraper(embedList).then(resolve);
	});
	*/
}

module.exports = scrape;

/*
(async () => {
	console.time('scraping');
	const streams = await scrape({
		title: 'Captain Marvel',
		year: 2019,
		ids: {
			trakt: 193963,
			slug: 'captain-marvel-2019',
			imdb: 'tt4154664',
			tmdb: 299537
		}
	}, 'movie');
	console.timeEnd('scraping');

	console.log(streams);
})();
*/