process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const { BrowserWindow, app, ipcMain } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const childProcess = require('child_process');
const { trakt, tmdb, justwatch } = require('./util');
const IMDBClient = require('./util/imdb');
const imdb = new IMDBClient();

let SCRAPE_PROCESS;
let LOCAL_RESOURCES_ROOT;
if (isDev()) {
	LOCAL_RESOURCES_ROOT = __dirname;
} else {
	LOCAL_RESOURCES_ROOT = `${__dirname}/../`;
}

const DATA_ROOT = app.getPath('userData').replace(/\\/g, '/') + '/app_data';
const JUSTWATCH_GENRES = [
	'Action & Adventure',
	'Animation',
	'Comedy',
	'Crime',
	'Documentary',
	'Drama',
	'Fantasy',
	'History',
	'Horror',
	'Kids & Family',
	'Music & Musical',
	'Mystery & Thriller',
	'Romance',
	'Science-Fiction',
	'Sport & Fitness',
	'War & Military',
	'Western'
];

let ApplicationWindow;

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit(); // OSX
	}
});

app.on('ready', () => {
	ApplicationWindow = new BrowserWindow({
		title: 'Stream Box',
		icon: `${LOCAL_RESOURCES_ROOT}/icon.ico`,
		minHeight: '300px',
		minWidth: '500px',
		//fullscreen: true,
		webPreferences: {
			nodeIntegration: true
		}
	});

	if (!isDev()) {
		ApplicationWindow.setMenu(null);
	}
	ApplicationWindow.maximize();

	ApplicationWindow.webContents.on('did-finish-load', () => {
		ApplicationWindow.show();
		ApplicationWindow.focus();
	});

	ApplicationWindow.loadURL(url.format({
		pathname: path.join(__dirname, '/app/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	ApplicationWindow.on('closed', () => {
		ApplicationWindow = null;
	});
});

ipcMain.on('initialize', async event => {
	event.sender.send('initializing');
	await initialize();
	event.sender.send('initialized');
});

ipcMain.on('ready', async event => {
	let trendingMovies = await trakt.trendingMovies();
	const popularMovies = await justwatch.getPopularMovies();
	const popularTVShows = await justwatch.getPopularTVShows();

	trendingMovies = await Promise.all(trendingMovies.map(async({ movie }) => {
		movie.images = await tmdb.movieImages(movie.ids.imdb);
		return movie;
	}));

	event.sender.send('update-home-carousel', trendingMovies);
	event.sender.send('update-home-popular-movies', popularMovies);
	event.sender.send('update-home-popular-tvshows', popularTVShows);
});

ipcMain.on('get-search-suggestions', async(event, { search_query }) => {
	const suggestions = await justwatch.searchAll(search_query, 1, 5);
	event.sender.send('search-suggestions', suggestions);
});

ipcMain.on('load-media-details', async(event, { id }) => {
	const details = await justwatch.movieDetails(id);
	const related = await justwatch.relatedMedia(id, details.object_type);

	const imdbId = (details.external_ids.find(id => id.provider === 'imdb')).external_id;

	const cast = (await imdb.cast(imdbId))
		.map(castMember => {
			const metadata = {
				name: castMember.name,
				characters: castMember.characters,
			};
			if (castMember.image) metadata.profile = castMember.image.url;

			return metadata;
		});

	event.sender.send('update-media-details', {
		id,
		imdb_id: imdbId,
		media_type: details.object_type,
		title: details.title,
		age_rating: details.age_certification || 'Not Rated',
		runtime: details.runtime,
		genres: details.genre_ids.map(id => JUSTWATCH_GENRES[id - 1]),
		release_year: details.original_release_year,
		synopsis: details.short_description,
		cast,
		videos: details.clips,
		related_media: related,
		images: {
			backdrop: `https://images.justwatch.com${details.backdrops[0].backdrop_url.replace('{profile}', 's1440')}`,
			poster: `https://images.justwatch.com${details.poster.replace('{profile}', 's592')}`
		}
	});
});

ipcMain.on('search-media', async(event, { search_query, type }) => {
	let results;

	switch (type) {
		case 'movie':
			results = await justwatch.searchMovies(search_query);
			break;
		case 'show':
			results = await justwatch.searchShows(search_query);
			break;
	}

	event.sender.send('search-results', { type, search_query, results });
});

ipcMain.on('scrape-streams', async(event, { id, season, episode }) => {
	// Using a child process here so that I can kill the entire scraping procress at once
	// This way any lingering requests or processing can all be killed at one time with no checks
	if (SCRAPE_PROCESS) {
		SCRAPE_PROCESS.kill();
	}

	const _arguments = [id, season, episode].filter(val => val);

	SCRAPE_PROCESS = childProcess.fork('./scrape.js', _arguments, {
		stdio: 'ignore'
	});

	SCRAPE_PROCESS.on('message', message => {
		if (message.event === 'stream') {
			event.sender.send('stream', message.data);
		} else if (message.event === 'finished') {
			if (!SCRAPE_PROCESS.killed) {
				SCRAPE_PROCESS.kill();
			}
		} else {
			throw new Error ('Unknown scrape process event', message.event);
		}
	});
});

async function initialize() {
	fs.ensureDirSync(`${DATA_ROOT}/cache/images`);
	fs.ensureDirSync(`${DATA_ROOT}/cache/json`);

	if (!fs.existsSync(`${DATA_ROOT}/cache/json/settings.json`)) {
		fs.writeFileSync(`${DATA_ROOT}/cache/json/settings.json`, JSON.stringify({}));
	}

	return new Promise(resolve => resolve());
}

// https://github.com/electron/electron/issues/7714#issuecomment-255835799
function isDev() {
	return process.mainModule.filename.indexOf('app.asar') === -1;
}