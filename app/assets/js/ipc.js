/* eslint-env browser */
/*
	global
		CURRENT_LOADED_PAGE
		OVERLAY_SEARCH_BAR_INPUT
		OVERLAY_SEARCH_BAR_SPINNER
		OVERLAY_SEARCH_SUGGESTIONS
		HOME_CAROUSEL_LIST
		HOME_MOVIE_LIST
		HOME_TVSHOW_LIST
		MEDIA_DETAILS_PAGE_WATCH_NOW
		MEDIA_DETAILS_PAGE_BACKDROP
		MEDIA_DETAILS_PAGE_TITLE
		MEDIA_DETAILS_PAGE_AGE_RATING
		MEDIA_DETAILS_PAGE_RUNTIME
		MEDIA_DETAILS_PAGE_GENRES
		MEDIA_DETAILS_PAGE_RELEASE_YEAR
		MEDIA_DETAILS_PAGE_POSTER
		MEDIA_DETAILS_PAGE_SYNOPSIS
		MEDIA_DETAILS_PAGE_CAST
		MEDIA_DETAILS_PAGE_VIDEOS
		MEDIA_DETAILS_PAGE_RELATED
		MOVIES_PAGE_MEDIA_LIST
		MOVIES_PAGE_SEARCH_QUERY
		loadPage
		loadMediaDetailsPage
		clearSearchSuggestions
		cachedImageUrl
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

const {ipcRenderer} = require('electron');
let currentSelectedMediaId;
let currentSelectedMediaCast = [];
let currentSelectedMediaCastPosition = -1;
const castListObserver = new IntersectionObserver(castListObserverCallback, {
	root: document.querySelector('#media-details-page .cast .body'),
	rootMargin: '0px',
	threshold: 1.0
});

function loadMediaDetails(id) {
	if (currentSelectedMediaId !== id) {
		disallowBodyScroll();
		showLoader();
		
		ipcRenderer.send('load-media-details', {
			id
		});
	} else {
		loadMediaDetailsPage();
	}
}

function getSearchSuggestions() {
	const searchQuery = OVERLAY_SEARCH_BAR_INPUT.value;
	ipcRenderer.send('get-search-suggestions', {
		search_query: searchQuery
	});
}

function searchMedia() {
	const searchQuery = OVERLAY_SEARCH_BAR_INPUT.value;
	let type;

	switch (CURRENT_LOADED_PAGE) {
		case 'home-page':
		case 'movies-page':
			type = 'movie';
			break;
		case 'tvshows-page':
			type = 'show';
			break;
		default:
			type = 'movie';
			break;
	}

	ipcRenderer.send('search-media', {
		search_query: searchQuery,
		type
	});

	showLoader();
}

function castListObserverCallback(entries) {
	if (entries[0].intersectionRatio === 1) {
		loadCastListSection();
	}
}

function updateCastListObserver() {
	castListObserver.disconnect();
	castListObserver.observe([...MEDIA_DETAILS_PAGE_CAST.querySelectorAll('img')].pop());
}

function loadCastListSection() {
	const section = currentSelectedMediaCast.slice(currentSelectedMediaCastPosition+1, currentSelectedMediaCastPosition+10);

	for (const castMember of section) {
		if (castMember.profile) {
			const img = document.createElement('img');
			img.classList.add('cast-member');
			img.src = cachedImageUrl(castMember.profile);
	
			MEDIA_DETAILS_PAGE_CAST.appendChild(img);
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

ipcRenderer.on('update-home-carousel', (event, movies) => {
	HOME_CAROUSEL_LIST.innerHTML = '';

	for (const movie of movies) {
		const template = document.querySelector('[template="carousel-item"]').content.firstElementChild.cloneNode(true);
		template.classList.add('hide');
		
		const backdrop = template.querySelector('.backdrop');
		const metadata = template.querySelector('.metadata');
		const title = metadata.querySelector('.title');
		const description = metadata.querySelector('.description');
		const watchButton = metadata.querySelector('.buttons .watch-now');

		backdrop.src = cachedImageUrl(`https://image.tmdb.org/t/p/original${movie.images.backdrops[0].file_path}`);
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
		
		const poster = template.querySelector('.poster');
		if (movie.poster) {
			poster.src = cachedImageUrl(`https://images.justwatch.com${movie.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMediaDetails(movie.id);
		});

		HOME_MOVIE_LIST.appendChild(template);
	}
});

ipcRenderer.on('update-home-popular-tvshows', (event, data) => {
	HOME_TVSHOW_LIST.innerHTML = '';

	const shows = data.items;

	for (const show of shows) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (show.poster) {
			poster.src = cachedImageUrl(`https://images.justwatch.com${show.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMediaDetails(show.id);
		});

		HOME_TVSHOW_LIST.appendChild(template);
	}

	hideLoader();
	allowBodyScroll();
});

ipcRenderer.on('search-suggestions', (event, data) => {
	clearSearchSuggestions();

	for (const searchSuggestion of data.items) {
		const template = document.querySelector('[template="search-suggestion"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		const title = template.querySelector('.title');
		const releaseYear = template.querySelector('.release-year');

		if (searchSuggestion.poster) {
			poster.src = cachedImageUrl(`https://images.justwatch.com${searchSuggestion.poster.replace('{profile}', 's166')}`);
		} // needs an else
		title.innerHTML = searchSuggestion.title;
		releaseYear.innerHTML = searchSuggestion.original_release_year;

		addEvent(template, 'click', () => {
			loadMediaDetails(searchSuggestion.id);
		});

		OVERLAY_SEARCH_SUGGESTIONS.appendChild(template);
	}

	OVERLAY_SEARCH_BAR_SPINNER.classList.add('hide');
});

ipcRenderer.on('update-media-details', (event, data) => {
	MEDIA_DETAILS_PAGE_WATCH_NOW.onclick = function() {
		showLoader();
		scrapeStreams(data.imdb_id);
	};

	setPlayerBackground(cachedImageUrl(data.images.backdrop));

	MEDIA_DETAILS_PAGE_BACKDROP.src = cachedImageUrl(data.images.backdrop);
	MEDIA_DETAILS_PAGE_TITLE.innerHTML = data.title;
	MEDIA_DETAILS_PAGE_AGE_RATING.innerHTML = data.age_rating;
	MEDIA_DETAILS_PAGE_RUNTIME.innerHTML = `${Math.floor(data.runtime / 60)}h${data.runtime % 60}m`;
	MEDIA_DETAILS_PAGE_GENRES.innerHTML = data.genres.join(', ');
	MEDIA_DETAILS_PAGE_RELEASE_YEAR.innerHTML = data.release_year;
	MEDIA_DETAILS_PAGE_POSTER.src = cachedImageUrl(data.images.poster);
	MEDIA_DETAILS_PAGE_SYNOPSIS.innerHTML = data.synopsis;

	MEDIA_DETAILS_PAGE_CAST.innerHTML = '';
	MEDIA_DETAILS_PAGE_VIDEOS.innerHTML = '';
	MEDIA_DETAILS_PAGE_RELATED.innerHTML = '';

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
	
			MEDIA_DETAILS_PAGE_VIDEOS.appendChild(iframe);
		}
	}

	for (const related of data.related_media.items) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (related.poster) {
			poster.src = cachedImageUrl(`https://images.justwatch.com${related.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMediaDetails(related.id);
		});

		MEDIA_DETAILS_PAGE_RELATED.appendChild(template);
	}

	currentSelectedMediaId = data.id;

	loadMediaDetailsPage();
	hideLoader();
	allowBodyScroll();
});


ipcRenderer.on('search-results', (event, {type, search_query, results}) => {
	const pageId = (type === 'show' ? 'tvshows-page' : 'movies-page');
	const mediaList = (type === 'show' ? MOVIES_PAGE_MEDIA_LIST : MOVIES_PAGE_MEDIA_LIST); // Update to support the tv show page
	
	MOVIES_PAGE_SEARCH_QUERY.innerHTML = search_query;

	mediaList.innerHTML = '';

	const shows = results.items;

	for (const show of shows) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (show.poster) {
			poster.src = cachedImageUrl(`https://images.justwatch.com${show.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMediaDetails(show.id);
		});

		mediaList.appendChild(template);
	}

	loadPage(pageId);
	hideLoader();
});

ipcRenderer.on('streams', (event, streams) => {
	hideLoader();

	const source = streams[0]; // default to first stream
	if (source) {
		startStream(source.file);
	} else {
		alert('No streams found');
	}
});

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.getSearchSuggestions = getSearchSuggestions;
	this.searchMedia = searchMedia;
}();