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
		SEARCH_PAGE_MEDIA_LIST
		SEARCH_PAGE_SEARCH_INPUT
		loadMovieDetailsPage
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

function loadMovieDetails(id, type) {
	if (currentSelectedMediaId !== id) {
		disallowBodyScroll();
		showLoader();
		
		ipcRenderer.send('load-media-details', {
			id,
			type
		});
	} else {
		loadMovieDetailsPage();
	}
}

function searchMedia() {
	const searchQuery = SEARCH_PAGE_SEARCH_INPUT.value;
	if (searchQuery.trim() === '') {
		return;
	}

	const filters = [...document.querySelectorAll('.search-filter')]
		.map(filter => {
			const optionIndex = filter.querySelector('.filter-value').dataset.optionIndex;
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

function loadCastListSection() {
	const section = currentSelectedMediaCast.slice(currentSelectedMediaCastPosition+1, currentSelectedMediaCastPosition+10);

	for (const castMember of section) {
		if (castMember.profile) {
			const img = document.createElement('img');
			img.classList.add('cast-member');
			img.src = cachedImageUrl(castMember.profile);
	
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
			loadMovieDetails(movie.id, movie.object_type);
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
			loadMovieDetails(show.id, show.object_type);
		});

		HOME_TVSHOW_LIST.appendChild(template);
	}

	hideLoader();
	allowBodyScroll();
});

ipcRenderer.on('update-media-details', (event, data) => {
	MOVIE_DETAILS_PAGE_WATCH_NOW.onclick = function() {
		showLoader();
		scrapeStreams(data.imdb_id);
	};

	setPlayerBackground(cachedImageUrl(data.images.backdrop));

	MOVIE_DETAILS_PAGE_BACKDROP.src = cachedImageUrl(data.images.backdrop);
	MOVIE_DETAILS_PAGE_TITLE.innerHTML = data.title;
	MOVIE_DETAILS_PAGE_AGE_RATING.innerHTML = data.age_rating;
	MOVIE_DETAILS_PAGE_RUNTIME.innerHTML = `${Math.floor(data.runtime / 60)}h${data.runtime % 60}m`;
	MOVIE_DETAILS_PAGE_GENRES.innerHTML = data.genres.join(', ');
	MOVIE_DETAILS_PAGE_RELEASE_YEAR.innerHTML = data.release_year;
	MOVIE_DETAILS_PAGE_POSTER.src = cachedImageUrl(data.images.poster);
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
			poster.src = cachedImageUrl(`https://images.justwatch.com${related.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMovieDetails(related.id, related.object_type);
		});

		MOVIE_DETAILS_PAGE_RELATED.appendChild(template);
	}

	currentSelectedMediaId = data.id;

	loadMovieDetailsPage();
	hideLoader();
	allowBodyScroll();
});


ipcRenderer.on('search-results', (event, results) => {
	SEARCH_PAGE_MEDIA_LIST.innerHTML = '';

	const media = results.items;

	for (const item of media) {
		const template = document.querySelector('[template="media"]').content.firstElementChild.cloneNode(true);
		
		const poster = template.querySelector('.poster');
		if (item.poster) {
			poster.src = cachedImageUrl(`https://images.justwatch.com${item.poster.replace('{profile}', 's166')}`);
		} // needs an else

		addEvent(template, 'click', () => {
			loadMovieDetails(item.id, item.object_type);
		});

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
	console.log(stream);
});

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.searchMedia = searchMedia;
}();