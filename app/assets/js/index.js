/* eslint-env browser */

const imageCache = require('image-cache');

// Navigation globals
const NAV_ALL = document.querySelectorAll('[data-navigation]');
const NAV_HOME = document.querySelector('[data-navigation="home-page"]');
const NAV_MOVIES = document.querySelector('[data-navigation="movies-page"]');
const NAV_TVSHOWS = document.querySelector('[data-navigation="tvshows-page"]');
const NAV_GENRES = document.querySelector('[data-navigation="genres-page"]');
const NAV_FAVORITES = document.querySelector('[data-navigation="favorites-page"]');

// Home page globals
const HOME_CAROUSEL_LIST = document.querySelector('#home-page .carousel');
const HOME_MOVIE_LIST = document.querySelector('#home-page-popular-movies .body');
const HOME_TVSHOW_LIST = document.querySelector('#home-page-popular-tvshows .body');

// Media Details page globals
const MEDIA_DETAILS_PAGE = document.getElementById('media-details-page');
const MEDIA_DETAILS_PAGE_BACKDROP = MEDIA_DETAILS_PAGE.querySelector('.header .wrapper .backdrop');
const MEDIA_DETAILS_PAGE_TITLE = MEDIA_DETAILS_PAGE.querySelector('.header .wrapper .metadata .title');
const MEDIA_DETAILS_PAGE_AGE_RATING = MEDIA_DETAILS_PAGE.querySelector('.header .wrapper .metadata .details .age-rating');
const MEDIA_DETAILS_PAGE_RUNTIME = MEDIA_DETAILS_PAGE.querySelector('.header .wrapper .metadata .details .runtime');
const MEDIA_DETAILS_PAGE_GENRES = MEDIA_DETAILS_PAGE.querySelector('.header .wrapper .metadata .details .genres');
const MEDIA_DETAILS_PAGE_RELEASE_YEAR = MEDIA_DETAILS_PAGE.querySelector('.header .wrapper .metadata .details .release-year');
const MEDIA_DETAILS_PAGE_POSTER = MEDIA_DETAILS_PAGE.querySelector('.content img.poster');
const MEDIA_DETAILS_PAGE_SYNOPSIS = MEDIA_DETAILS_PAGE.querySelector('.content .information .synopsis .body');
const MEDIA_DETAILS_PAGE_CAST = MEDIA_DETAILS_PAGE.querySelector('.content .information .cast .body');
const MEDIA_DETAILS_PAGE_VIDEOS = MEDIA_DETAILS_PAGE.querySelector('.content .other-media .videos .body');
const MEDIA_DETAILS_PAGE_RELATED = MEDIA_DETAILS_PAGE.querySelector('.content .other-media .related .body');

function addEvent(object, event, func) {
	object.addEventListener(event, func, true);
}

function cachedImageUrl(url) {
	if (imageCache.isCachedSync(url)) {
		const cachedPosterSrc = imageCache.getCacheSync(url);
		return cachedPosterSrc.data;
	} else {
		// image-cache doesn't have a sync version of this method
		imageCache.setCache(url, () => {});
	}

	return url;
}

function loadPage(id) {
	const currentActivePage = document.querySelector('.page.active');
	if (currentActivePage) {
		currentActivePage.classList.remove('active');
	}

	document.getElementById(id).classList.add('active');
}

function loadHomePage() {
	loadPage('home-page');
}

function loadMediaDetailsPage() {
	loadPage('media-details-page');
}

NAV_ALL.forEach(element => {
	addEvent(element, 'click', () => {
		const selectedPage = document.querySelector('.page.active');

		if (selectedPage.id === element.dataset.navigation) {
			return;
		}

		loadPage(element.dataset.navigation);
	});
});

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.NAV_HOME = NAV_HOME;
	this.NAV_MOVIES = NAV_MOVIES;
	this.NAV_TVSHOWS = NAV_TVSHOWS;
	this.NAV_GENRES = NAV_GENRES;
	this.NAV_FAVORITES = NAV_FAVORITES;
	this.HOME_CAROUSEL_LIST = HOME_CAROUSEL_LIST;
	this.HOME_MOVIE_LIST = HOME_MOVIE_LIST;
	this.HOME_TVSHOW_LIST = HOME_TVSHOW_LIST;
	this.MEDIA_DETAILS_PAGE_BACKDROP = MEDIA_DETAILS_PAGE_BACKDROP;
	this.MEDIA_DETAILS_PAGE_TITLE = MEDIA_DETAILS_PAGE_TITLE;
	this.MEDIA_DETAILS_PAGE_AGE_RATING = MEDIA_DETAILS_PAGE_AGE_RATING;
	this.MEDIA_DETAILS_PAGE_RUNTIME = MEDIA_DETAILS_PAGE_RUNTIME;
	this.MEDIA_DETAILS_PAGE_GENRES = MEDIA_DETAILS_PAGE_GENRES;
	this.MEDIA_DETAILS_PAGE_RELEASE_YEAR = MEDIA_DETAILS_PAGE_RELEASE_YEAR;
	this.MEDIA_DETAILS_PAGE_POSTER = MEDIA_DETAILS_PAGE_POSTER;
	this.MEDIA_DETAILS_PAGE_SYNOPSIS = MEDIA_DETAILS_PAGE_SYNOPSIS;
	this.MEDIA_DETAILS_PAGE_CAST = MEDIA_DETAILS_PAGE_CAST;
	this.MEDIA_DETAILS_PAGE_VIDEOS = MEDIA_DETAILS_PAGE_VIDEOS;
	this.MEDIA_DETAILS_PAGE_RELATED = MEDIA_DETAILS_PAGE_RELATED;

	this.cachedImageUrl = cachedImageUrl;
	this.loadHomePage = loadHomePage;
	this.loadMediaDetailsPage = loadMediaDetailsPage;
}();