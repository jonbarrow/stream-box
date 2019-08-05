/* eslint-env browser */
/*
	global
		HOME_CAROUSEL_LIST
		HOME_MOVIE_LIST
		HOME_TVSHOW_LIST
		MOVIE_DETAILS_PAGE_WATCH_NOW
		MOVIE_DETAILS_PAGE_BACKDROP
		MOVIE_DETAILS_PAGE_TITLE
		MOVIE_DETAILS_PAGE_AGE_RATING
		MOVIE_DETAILS_PAGE_RUNTIME
		MOVIE_DETAILS_PAGE_GENRES
		MOVIE_DETAILS_PAGE_RELEASE_YEAR
		MOVIE_DETAILS_PAGE_POSTER
		MOVIE_DETAILS_PAGE_SYNOPSIS
		MOVIE_DETAILS_PAGE_CAST
		MOVIE_DETAILS_PAGE_VIDEOS
		MOVIE_DETAILS_PAGE_RELATED
		SHOW_DETAILS_PAGE_BACKDROP
		SHOW_DETAILS_PAGE_TITLE
		SHOW_DETAILS_PAGE_AGE_RATING
		SHOW_DETAILS_PAGE_GENRES
		SHOW_DETAILS_PAGE_RELEASE_YEAR
		SHOW_DETAILS_PAGE_POSTER
		SHOW_DETAILS_PAGE_SYNOPSIS
		SHOW_DETAILS_PAGE_RELATED
		SHOW_DETAILS_PAGE_EPISODES
		SHOW_DETAILS_PAGE_SEASON_SELECTION
		SEARCH_PAGE_MEDIA_LIST
		SEARCH_PAGE_SEARCH_INPUT
		loadMovieDetailsPage
		loadShowDetailsPage
		addEvent
		showLoader
		hideLoader
		allowBodyScroll
		disallowBodyScroll
		setPlayerBackground
		startStream
*/


/*
	IPC events
*/

const {ipcRenderer, remote} = require('electron');
const path = require('path');
const appPath = remote.app.getAppPath();
const imageCache = require(path.resolve(appPath, './image_cache'));

let currentSelectedMediaId;
let currentSelectedMediaCast = [];
let currentSelectedMediaCastPosition = -1;
const castListObserver = new IntersectionObserver(castListObserverCallback, {
	root: document.querySelector('#media-details-page .cast .body'),
	rootMargin: '0px',
	threshold: 1.0
});

function loadMovieDetails(id) {
	if (currentSelectedMediaId !== id) {
		disallowBodyScroll();
		showLoader();
		
		ipcRenderer.send('load-movie-details', id);
	} else {
		loadMovieDetailsPage();
	}
}

function loadShowDetails(id, init) { // init, for the initial load
	if (currentSelectedMediaId !== id) {
		disallowBodyScroll();
		showLoader();
		
		ipcRenderer.send('load-show-details', {id, init});
	} else {
		loadShowDetailsPage();
	}
}

function searchMedia() {
	const searchQuery = SEARCH_PAGE_SEARCH_INPUT.value;
	if (searchQuery.trim() === '') {
		return;
	}

	const filters = [...document.querySelectorAll('#search-filters .dropdown')]
		.map(filter => {
			const optionIndex = filter.querySelector('.dropdown-value').dataset.optionIndex;
			return {
				type: filter.dataset.filter,
				value: filter.querySelector(`[data-index="${optionIndex}"]`).dataset.value
			};
		});

	ipcRenderer.send('search-media', {search_query: searchQuery, filters});

	showLoader();
}

function castListObserverCallback(entries) {
	if (entries[0].intersectionRatio === 1) {
		loadCastListSection();
	}
}

function updateCastListObserver() {
	castListObserver.disconnect();
	castListObserver.observe([...MOVIE_DETAILS_PAGE_CAST.querySelectorAll('img')].pop());
}

async function loadCastListSection() {
	const section = currentSelectedMediaCast.slice(currentSelectedMediaCastPosition+1, currentSelectedMediaCastPosition+10);

	for (const castMember of section) {
		if (castMember.profile) {
			const img = document.createElement('img');
			img.classList.add('cast-member');
			img.src = await imageCache(castMember.profile);
	
			MOVIE_DETAILS_PAGE_CAST.appendChild(img);
		}
	}

	currentSelectedMediaCastPosition += 10;
	if (currentSelectedMediaCastPosition < currentSelectedMediaCast.length) {
		updateCastListObserver();
	} else {
		castListObserver.disconnect();
	}
}

function scrapeStreams(id, season, episode) {
	ipcRenderer.send('scrape-streams', {
		id,
		season, episode
	});
}

(() => {
	ipcRenderer.send('initialize');
})();

ipcRenderer.on('initializing', () => {
});

ipcRenderer.on('initialized', () => {
	ipcRenderer.send('ready');
});

ipcRenderer.on('update-home-carousel', async (event, movies) => {
	HOME_CAROUSEL_LIST.innerHTML = '';

	for (const movie of movies) {
		const template = document.querySelector('[template="carousel-item"]').content.firstElementChild.cloneNode(true);
		template.classList.add('hide');
		
		const backdrop = template.querySelector('.backdrop');
		const metadata = template.querySelector('.metadata');
		const title = metadata.querySelector('.title');
		const description = metadata.querySelector('.description');
		const watchButton = metadata.querySelector('.buttons .watch-now');

		backdrop.src = await imageCache(`https://image.tmdb.org/t/p/original${movie.images.backdrops[0].file_path}`);
		title.innerHTML = movie.title;
		description.innerHTML = movie.overview;

		addEvent(watchButton, 'click', () => {
			// Load stream list immediately
		});

		HOME_CAROUSEL_LIST.appendChild(template);
	}

	document.querySelector('.carousel-item').classList.remove('hide'); // For now, only show the first one
});

ipcRenderer.on('update-home-popular-movies', async (event, data) => {
	HOME_MOVIE_LIST.innerHTML = '';

	const movies = data.items;

	for (const movie of movies) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		template.dataset.kbUp ='#top-navigation ol li';
		template.dataset.kbDown ='#home-page-popular-tvshows .media';
		
		const poster = template.querySelector('.poster');
		if (movie.poster) {
			poster.src = await imageCache(`https://images.justwatch.com${movie.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMovieDetails(movie.id);
		});

		HOME_MOVIE_LIST.appendChild(template);
	}
});

ipcRenderer.on('update-home-popular-tvshows', async (event, data) => {
	HOME_TVSHOW_LIST.innerHTML = '';

	const shows = data.items;

	for (const show of shows) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		template.dataset.kbUp ='#home-page-popular-movies .media';
		
		const poster = template.querySelector('.poster');
		if (show.poster) {
			poster.src = await imageCache(`https://images.justwatch.com${show.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadShowDetails(show.id, true);
		});

		HOME_TVSHOW_LIST.appendChild(template);
	}

	hideLoader();
	allowBodyScroll();
});

ipcRenderer.on('update-movie-details', async (event, data) => {
	MOVIE_DETAILS_PAGE_WATCH_NOW.onclick = function() {
		showLoader();
		scrapeStreams(data.imdb_id);
	};

	setPlayerBackground(await imageCache(data.images.backdrop));

	MOVIE_DETAILS_PAGE_BACKDROP.src = await imageCache(data.images.backdrop);
	MOVIE_DETAILS_PAGE_TITLE.innerHTML = data.title;
	MOVIE_DETAILS_PAGE_AGE_RATING.innerHTML = data.age_rating;
	MOVIE_DETAILS_PAGE_RUNTIME.innerHTML = `${Math.floor(data.runtime / 60)}h${data.runtime % 60}m`;
	MOVIE_DETAILS_PAGE_GENRES.innerHTML = data.genres.join(', ');
	MOVIE_DETAILS_PAGE_RELEASE_YEAR.innerHTML = data.release_year;
	MOVIE_DETAILS_PAGE_POSTER.src = await imageCache(data.images.poster);
	MOVIE_DETAILS_PAGE_SYNOPSIS.innerHTML = data.synopsis;

	MOVIE_DETAILS_PAGE_CAST.innerHTML = '';
	MOVIE_DETAILS_PAGE_VIDEOS.innerHTML = '';
	MOVIE_DETAILS_PAGE_RELATED.innerHTML = '';

	currentSelectedMediaCast = data.cast;
	currentSelectedMediaCastPosition = -1;

	loadCastListSection();

	if (data.videos) {
		for (const video of data.videos) {
			const iframe = document.createElement('iframe');
			iframe.classList.add('video');
			iframe.src = `https://www.youtube-nocookie.com/embed/${video.external_id}`;
			iframe.frameBorder = 0;
			iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
			iframe.allowfullscreen = true;
	
			MOVIE_DETAILS_PAGE_VIDEOS.appendChild(iframe);
		}
	}

	for (const related of data.related_media.items) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (related.poster) {
			poster.src = await imageCache(`https://images.justwatch.com${related.poster.replace('{profile}', 's166')}`);
		} // needs an else

		if (related.object_type === 'movie') {
			addEvent(template, 'click', () => {
				loadMovieDetails(related.id);
			});
		} else if (related.object_type === 'show') {
			addEvent(template, 'click', () => {
				loadShowDetails(related.id, true);
			});
		}

		MOVIE_DETAILS_PAGE_RELATED.appendChild(template);
	}

	currentSelectedMediaId = data.id;

	loadMovieDetailsPage();
	hideLoader();
	allowBodyScroll();
});

ipcRenderer.on('update-show-details', async (event, data) => {
	setPlayerBackground(await imageCache(data.images.backdrop));

	SHOW_DETAILS_PAGE_BACKDROP.src = await imageCache(data.images.backdrop);
	SHOW_DETAILS_PAGE_TITLE.innerHTML = data.title;
	SHOW_DETAILS_PAGE_AGE_RATING.innerHTML = data.age_rating;
	SHOW_DETAILS_PAGE_GENRES.innerHTML = data.genres.join(', ');
	SHOW_DETAILS_PAGE_RELEASE_YEAR.innerHTML = data.release_year;
	SHOW_DETAILS_PAGE_POSTER.src = await imageCache(data.images.poster);
	SHOW_DETAILS_PAGE_SYNOPSIS.innerHTML = data.synopsis;

	SHOW_DETAILS_PAGE_RELATED.innerHTML = '';
	SHOW_DETAILS_PAGE_SEASON_SELECTION.querySelector('.dropdown-options').innerHTML = '';
	SHOW_DETAILS_PAGE_EPISODES.innerHTML = '';

	for (const season of data.seasons) {
		const option = document.createElement('span');
		
		addEvent(option, 'click', () => {
			loadShowDetails(season.id);
		});

		option.classList.add('option');
		option.dataset.index = season.season_number-1;
		option.dataset.value = season.season_number;
		option.innerText = season.title;

		if (season.season_number === data.season) {
			option.classList.add('selected');
			SHOW_DETAILS_PAGE_SEASON_SELECTION.querySelector('.dropdown-value').innerText = season.title;
		}

		SHOW_DETAILS_PAGE_SEASON_SELECTION.querySelector('.dropdown-options').appendChild(option);
	}

	for (const episode of data.episodes) {
		const template = document.querySelector('[template="episode"]').content.firstElementChild.cloneNode(true);
		
		const screenshot = template.querySelector('.screenshot');
		const title = template.querySelector('.title');

		if (episode.screenshot) {
			screenshot.src = await imageCache(episode.screenshot);
		}

		title.innerHTML = `E${episode.episode_number} ${episode.title}`;

		addEvent(template, 'click', () => {
			showLoader();
			scrapeStreams(data.imdb_id, data.season, episode.episode_number);
		});

		SHOW_DETAILS_PAGE_EPISODES.appendChild(template);
	}

	for (const related of data.related_media.items) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (related.poster) {
			poster.src = await imageCache(`https://images.justwatch.com${related.poster.replace('{profile}', 's166')}`);
		} // needs an else

		if (related.object_type === 'movie') {
			addEvent(template, 'click', () => {
				loadMovieDetails(related.id);
			});
		} else if (related.object_type === 'show') {
			addEvent(template, 'click', () => {
				loadShowDetails(related.id, true);
			});
		}

		SHOW_DETAILS_PAGE_RELATED.appendChild(template);
	}

	loadShowDetailsPage();
	hideLoader();
	allowBodyScroll();
});

ipcRenderer.on('search-results', async (event, results) => {
	SEARCH_PAGE_MEDIA_LIST.innerHTML = '';

	const media = results.items;

	for (const item of media) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (item.poster) {
			poster.src = await imageCache(`https://images.justwatch.com${item.poster.replace('{profile}', 's166')}`);
		} // needs an else

		if (item.object_type === 'movie') {
			addEvent(template, 'click', () => {
				loadMovieDetails(item.id);
			});
		} else if (item.object_type === 'show') {
			addEvent(template, 'click', () => {
				loadShowDetails(item.id, true);
			});
		}

		SEARCH_PAGE_MEDIA_LIST.appendChild(template);
	}

	hideLoader();
});

ipcRenderer.once('stream', (event, stream) => {
	hideLoader();
	
	startStream(stream);
});

ipcRenderer.on('stream', (event, stream) => {
	// Populate a stream list to pick which stream should be played
	// console.log(stream);
});

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.searchMedia = searchMedia;
}();