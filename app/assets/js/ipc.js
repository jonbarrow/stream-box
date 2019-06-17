/* eslint-env browser */
/*
	global
		HOME_CAROUSEL_LIST
		HOME_MOVIE_LIST
		HOME_TVSHOW_LIST
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
		loadMediaDetailsPage
		cachedImageUrl
		addEvent
*/


/*
	IPC events
*/

const {ipcRenderer} = require('electron');
let currentSelectedMediaId;

function loadMediaDetails(id) {
	if (currentSelectedMediaId !== id) {
		ipcRenderer.send('load-media-details', {
			id
		});
	} else {
		loadMediaDetailsPage();
	}
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
		poster.src = cachedImageUrl(`https://images.justwatch.com${movie.poster.replace('{profile}', 's166')}`);

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
		poster.src = cachedImageUrl(`https://images.justwatch.com${show.poster.replace('{profile}', 's166')}`);

		addEvent(template, 'click', () => {
			loadMediaDetails(show.id);
		});

		HOME_TVSHOW_LIST.appendChild(template);
	}
});

ipcRenderer.on('update-media-details', (event, data) => {
	MEDIA_DETAILS_PAGE_BACKDROP.src = cachedImageUrl(data.images.backdrop);
	MEDIA_DETAILS_PAGE_TITLE.innerHTML = data.title;
	MEDIA_DETAILS_PAGE_AGE_RATING.innerHTML = data.age_rating;
	MEDIA_DETAILS_PAGE_RUNTIME.innerHTML = data.runtime;
	MEDIA_DETAILS_PAGE_GENRES.innerHTML = data.genres.join(', ');
	MEDIA_DETAILS_PAGE_RELEASE_YEAR.innerHTML = data.release_year;
	MEDIA_DETAILS_PAGE_POSTER.src = cachedImageUrl(data.images.poster);
	MEDIA_DETAILS_PAGE_SYNOPSIS.innerHTML = data.synopsis;

	MEDIA_DETAILS_PAGE_CAST.innerHTML = '';
	MEDIA_DETAILS_PAGE_VIDEOS.innerHTML = '';
	MEDIA_DETAILS_PAGE_RELATED.innerHTML = '';

	for (const castMember of data.cast) {
		if (castMember.profile) {
			const img = document.createElement('img');
			img.classList.add('cast-member');
			img.src = cachedImageUrl(castMember.profile);
	
			MEDIA_DETAILS_PAGE_CAST.appendChild(img);
		}
	}

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
		poster.src = cachedImageUrl(`https://images.justwatch.com${related.poster.replace('{profile}', 's166')}`);

		addEvent(template, 'click', () => {
			loadMediaDetails(related.id);
		});

		MEDIA_DETAILS_PAGE_RELATED.appendChild(template);
	}

	currentSelectedMediaId = data.id;
	loadMediaDetailsPage();
});