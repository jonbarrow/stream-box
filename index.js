process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
	// application specific logging, throwing an error, or other logic here
});

const {BrowserWindow, app, ipcMain} = require('electron');
const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const {trakt, tmdb, justwatch} = require('./util');
const IMDBClient = require('./util/imdb');
const imdb = new IMDBClient();

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
		title: 'Datapack Manager',
		icon: `${LOCAL_RESOURCES_ROOT}/icon.ico`,
		minHeight: '300px',
		minWidth: '500px'
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

	trendingMovies = await Promise.all(trendingMovies.map(async ({movie}) => {
		movie.images = await tmdb.movieImages(movie.ids.imdb);
		return movie;
	}));

	event.sender.send('update-home-carousel', trendingMovies);
	event.sender.send('update-home-popular-movies', popularMovies);
	event.sender.send('update-home-popular-tvshows', popularTVShows);
});

ipcMain.on('load-media-details', async (event, {id}) => {
	console.log(`Loading details for ${id}`);
	const details = await justwatch.movieDetails(id);
	const related = await justwatch.relatedMedia(id, details.object_type);

	const imdbId = (details.external_ids.find(id => id.provider === 'imdb')).external_id;

	/*
	let cast = await trakt.movieCast(imdbId);
	cast = await Promise.all(cast.map(async castMember => {
		const images = await tmdb.personImages(castMember.person.ids.tmdb);
		if (images.profiles && images.profiles.length > 0) {
			castMember.profile = images.profiles[0];
		}
		return castMember;
	}));
	*/

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
		media_type: details.object_type,
		title: details.title,
		age_rating: details.age_certification || 'Not Rated',
		runtime: details.runtime,
		genres: details.genre_ids.map(id => JUSTWATCH_GENRES[id-1]),
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