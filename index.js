process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

const { BrowserWindow, app, ipcMain, globalShortcut } = require('electron');
const log = require('electron-log');
const fs = require('fs-extra');
const async = require('async');
const got = require('got');
const path = require('path');
const url = require('url');
const BackgroundTask = require('./background_task');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {ScrapeMovieError, ScrapeTvShowError} = require('./errors');
const { justwatch } = require('./util');

process.setUncaughtExceptionCaptureCallback(({stack}) => {
	log.error(`${stack}\n`);
});

let SCRAPE_PROCESS;
let LOCAL_RESOURCES_ROOT;
if (isDev()) {
	LOCAL_RESOURCES_ROOT = __dirname;
} else {
	LOCAL_RESOURCES_ROOT = `${__dirname}/../`;
}

const DATA_ROOT = app.getPath('userData').replace(/\\/g, '/');
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
let seriesDataStorage;

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit(); // OSX
	}
});

app.on('ready', () => {
	const MediaPlayPause = globalShortcut.register('MediaPlayPause', () => {
		ApplicationWindow.webContents.sendInputEvent({
			type: 'keyDown',
			keyCode: 'MediaPlayPause'
		});
	});

	if (!MediaPlayPause) {
		log.error('FAILED TO REGISTER MediaPlayPause SHORTCUT');
	}
	
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
	await initialize(event);
	event.sender.send('initialized');
});

ipcMain.on('ready', async event => {
	const popularMovies = await justwatch.getPopularMovies();
	const popularTVShows = await justwatch.getPopularTVShows();

	const images = [];

	async.parallel([
		callback => {
			for (const {poster} of popularMovies.items) {
				images.push(`https://images.justwatch.com${poster.replace('{profile}', 's166')}`);
			}
			callback();
		},
		callback => {
			for (const {poster} of popularTVShows.items) {
				images.push(`https://images.justwatch.com${poster.replace('{profile}', 's166')}`);
			}
			callback();
		},
	], () => {
		event.sender.send('update-home-page', {
			movies: popularMovies,
			shows: popularTVShows,
			images
		});
	});
});

ipcMain.on('load-movie-details', async(event, id) => {
	const details = await justwatch.movieDetails(id);
	
	const related = await justwatch.relatedMedia(id, 'movie');

	const imdbId = (details.external_ids.find(id => id.provider === 'imdb')).external_id;

	const images = [ // Images to bulk-cache
		`https://images.justwatch.com${details.backdrops[0].backdrop_url.replace('{profile}', 's1440')}`,
		`https://images.justwatch.com${details.poster.replace('{profile}', 's592')}`
	];

	for (const media of related.items) {
		images.push(`https://images.justwatch.com${media.poster.replace('{profile}', 's166')}`);
	}

	event.sender.send('update-movie-details', {
		id,
		imdb_id: imdbId,
		media_type: details.object_type,
		title: details.title,
		age_rating: details.age_certification || 'Not Rated',
		runtime: details.runtime,
		genres: details.genre_ids.map(id => JUSTWATCH_GENRES[id - 1]),
		release_year: details.original_release_year,
		synopsis: details.short_description,
		videos: details.clips,
		related_media: related,
		backdrop: `https://images.justwatch.com${details.backdrops[0].backdrop_url.replace('{profile}', 's1440')}`,
		poster: `https://images.justwatch.com${details.poster.replace('{profile}', 's592')}`,
		images
	});
});

ipcMain.on('load-show-details', async(event, {id, init}) => {
	let seasonDetails;
	let showDetails;

	if (init) {
		showDetails = await justwatch.showDetails(id);
		seasonDetails = await justwatch.seasonDetails(showDetails.seasons[0].id);
	} else {
		seasonDetails = await justwatch.seasonDetails(id);
		showDetails = await justwatch.showDetails(seasonDetails.show_id);
	}

	const imdbId = (showDetails.external_ids.find(id => id.provider === 'imdb')).external_id;
	const tmdbId = (showDetails.external_ids.find(id => id.provider === 'tmdb')).external_id;
	const lastWatched = seriesDataStorage.get(imdbId).toJSON();
	let lastWatchedData;

	if (!lastWatched) {
		lastWatchedData = {
			last_watched: {
				season: 1,
				episode: 1
			}
		};

		seriesDataStorage.set(imdbId, lastWatchedData).write();
	} else {
		lastWatchedData = lastWatched;
	}

	if (init) {
		const currentSeason = showDetails.seasons.find(({season_number}) => season_number === lastWatchedData.last_watched.season);

		seasonDetails = await justwatch.seasonDetails(currentSeason.id);
	} else {
		const oldData = seriesDataStorage.get(imdbId).toJSON();
		oldData.last_watched.season = seasonDetails.season_number;

		seriesDataStorage.get(imdbId).assign(oldData).write();
	}

	const episodes = seasonDetails.episodes.map(({title, episode_number}) => ({
		title,
		episode_number
	}));
	
	const extendedEpisodeData = await got.post('https://www.captainwatch.com/tvapi/episodes', {
		throwHttpErrors: false,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
		},
		body: `movieId=${tmdbId}&seasonNumber=${seasonDetails.season_number}`
	}).then(({body, statusCode}) => (statusCode === 200 ? JSON.parse(body) : {}));

	if (extendedEpisodeData.episodes) {
		for (const episode of episodes) {
			const extended = extendedEpisodeData.episodes.find(({episode_number}) => episode_number === episode.episode_number);
			if (extended && extended.still) {
				episode.screenshot = extended.still;
			}
		}
	}

	const related = await justwatch.relatedMedia(showDetails.id, 'show');

	const images = [ // Images to bulk-cache
		`https://images.justwatch.com${showDetails.backdrops[0].backdrop_url.replace('{profile}', 's1440')}`,
		`https://images.justwatch.com${seasonDetails.poster.replace('{profile}', 's592')}`
	];

	for (const media of related.items) {
		images.push(`https://images.justwatch.com${media.poster.replace('{profile}', 's166')}`);
	}

	for (const episode of episodes) {
		images.push(episode.screenshot);
	}

	event.sender.send('update-show-details', {
		id,
		imdb_id: imdbId,
		media_type: 'show',
		title: showDetails.title,
		season_title: seasonDetails.title,
		age_rating: seasonDetails.age_certification || 'Not Rated',
		genres: seasonDetails.genre_ids.map(id => JUSTWATCH_GENRES[id - 1]),
		release_year: seasonDetails.original_release_year,
		synopsis: seasonDetails.short_description || showDetails.short_description,
		season: seasonDetails.season_number,
		seasons: showDetails.seasons,
		episodes,
		related_media: related,
		backdrop: `https://images.justwatch.com${showDetails.backdrops[0].backdrop_url.replace('{profile}', 's1440')}`,
		poster: `https://images.justwatch.com${seasonDetails.poster.replace('{profile}', 's592')}`,
		images
	});
});

ipcMain.on('search-media', async(event, {search_query, filters}) => {
	let results;
	switch (filters[0].value) { // content-type
		case 'all':
		default:
			results = await justwatch.searchAll(search_query);
			break;
		case 'movie':
			results = await justwatch.searchMovies(search_query);
			break;
		case 'show':
			results = await justwatch.searchShows(search_query);
			break;
	}

	const images = [];

	for (const item of results.items) {
		if (item.poster) {
			images.push(`https://images.justwatch.com${item.poster.replace('{profile}', 's166')}`);
		}
	}

	event.sender.send('search-results', {
		results,
		images
	});
});

ipcMain.on('scrape-streams', async(event, { id, season, episode }) => {
	if (SCRAPE_PROCESS) {
		if (!SCRAPE_PROCESS.killed) {
			SCRAPE_PROCESS.kill();
		}
	}

	SCRAPE_PROCESS = new BackgroundTask(`${__dirname}/background/scrape.html`);

	SCRAPE_PROCESS.on('error', error => {
		if (season && episode) {
			log.error(new ScrapeTvShowError(id, season, episode, error));
		} else {
			log.error(new ScrapeMovieError(id, error));
		}
	});

	SCRAPE_PROCESS.on('ready', () => {
		SCRAPE_PROCESS.send('scrape', {id, season, episode});
	});

	SCRAPE_PROCESS.on('stream', stream => {
		console.log(stream);
		event.sender.send('stream', stream);
	});

	SCRAPE_PROCESS.on('finished', () => {
		if (!SCRAPE_PROCESS.killed) {
			SCRAPE_PROCESS.kill();
		}
	});
});

async function initialize() {
	fs.ensureDirSync(`${DATA_ROOT}/imageCache`);
	fs.ensureFileSync(`${DATA_ROOT}/series-data.json`);
	fs.ensureFileSync(`${DATA_ROOT}/config.json`);
	seriesDataStorage = low(new FileSync(`${DATA_ROOT}/series-data.json`));

	seriesDataStorage.defaults({}).write();
}

// https://github.com/electron/electron/issues/7714#issuecomment-255835799
function isDev() {
	return process.mainModule.filename.indexOf('app.asar') === -1;
}