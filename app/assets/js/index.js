/* eslint-env browser */

const imageCache = require('image-cache');

// Misc globals
const LOADER = document.getElementById('loader');
let CURRENT_LOADED_PAGE = 'home-page';

// Overlay globals
const OVERLAY_SEARCH_BAR_INPUT = document.getElementById('search-input');
const OVERLAY_SEARCH_BAR_SPINNER = document.querySelector('.search-suggestion.spinner');
const OVERLAY_SEARCH_SUGGESTIONS = document.getElementById('search-suggestions');

// Navigation globals
const NAV_ALL = document.querySelectorAll('[data-navigation]');
const NAV_HOME = document.querySelector('[data-navigation="home-page"]');
const NAV_MOVIES = document.querySelector('[data-navigation="movies-page"]');
const NAV_TVSHOWS = document.querySelector('[data-navigation="tvshows-page"]');
const NAV_GENRES = document.querySelector('[data-navigation="genres-page"]');
const NAV_FAVORITES = document.querySelector('[data-navigation="favorites-page"]');

// Media Details page globals
const MEDIA_DETAILS_PAGE = document.getElementById('media-details-page');
const MEDIA_DETAILS_PAGE_WATCH_NOW = document.getElementById('watch-now');
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

// Home page globals
const HOME_CAROUSEL_LIST = document.querySelector('#home-page .carousel');
const HOME_MOVIE_LIST = document.querySelector('#home-page-popular-movies .body');
const HOME_TVSHOW_LIST = document.querySelector('#home-page-popular-tvshows .body');

// Movies page globals
const MOVIES_PAGE = document.getElementById('movies-page');
const MOVIES_PAGE_SEARCH_QUERY = MOVIES_PAGE.querySelector('.query');
const MOVIES_PAGE_MEDIA_LIST = MOVIES_PAGE.querySelector('.list');

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
	hideOverlays();

	const currentActivePage = document.querySelector('.page.active');
	if (currentActivePage) {
		currentActivePage.classList.remove('active');
	}

	const selectedNavigation = document.querySelector('.navigation-item.selected');
	if (id !== selectedNavigation.dataset.navigation) {
		if (selectedNavigation) {
			selectedNavigation.classList.remove('selected');
		}
	
		const newSelecedtNav = document.querySelector(`[data-navigation="${id}"]`);
		if (newSelecedtNav) {
			newSelecedtNav.classList.add('selected');
		}
	}

	CURRENT_LOADED_PAGE = id;
	document.getElementById(id).classList.add('active');
}

function loadHomePage() {
	loadPage('home-page');
}

function loadMediaDetailsPage() {
	loadPage('media-details-page');
}

function showOverlay(id) {
	hideOverlays();

	document.getElementById(id).classList.add('active');
}

function hideOverlays() {
	const currentActiveOverlay = document.querySelector('.overlay.active');
	if (currentActiveOverlay) {
		currentActiveOverlay.classList.remove('active');
	}
}

function hideLoader() {
	LOADER.classList.add('hide');
}

function showLoader() {
	LOADER.classList.remove('hide');
}

function disallowBodyScroll() {
	document.body.classList.add('noscroll');
}

function allowBodyScroll() {
	document.body.classList.remove('noscroll');
}

const toggle = document.getElementsByClassName('stream-site');

for (let i = 0; i < toggle.length; i++) {
	toggle[i].addEventListener('click', function() {
		const content = this.querySelector('.streams');
		if (content.style.maxHeight) {
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = content.scrollHeight + 'px';
		} 
	});
}

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	this.CURRENT_LOADED_PAGE = CURRENT_LOADED_PAGE;
	this.OVERLAY_SEARCH_BAR_INPUT = OVERLAY_SEARCH_BAR_INPUT;
	this.OVERLAY_SEARCH_BAR_SPINNER = OVERLAY_SEARCH_BAR_SPINNER;
	this.OVERLAY_SEARCH_SUGGESTIONS = OVERLAY_SEARCH_SUGGESTIONS;
	this.NAV_HOME = NAV_HOME;
	this.NAV_MOVIES = NAV_MOVIES;
	this.NAV_TVSHOWS = NAV_TVSHOWS;
	this.NAV_GENRES = NAV_GENRES;
	this.NAV_FAVORITES = NAV_FAVORITES;
	this.MEDIA_DETAILS_PAGE_WATCH_NOW = MEDIA_DETAILS_PAGE_WATCH_NOW;
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
	this.HOME_CAROUSEL_LIST = HOME_CAROUSEL_LIST;
	this.HOME_MOVIE_LIST = HOME_MOVIE_LIST;
	this.HOME_TVSHOW_LIST = HOME_TVSHOW_LIST;
	this.MOVIES_PAGE_MEDIA_LIST = MOVIES_PAGE_MEDIA_LIST;
	this.MOVIES_PAGE_SEARCH_QUERY = MOVIES_PAGE_SEARCH_QUERY;

	this.cachedImageUrl = cachedImageUrl;
	this.loadPage = loadPage;
	this.loadHomePage = loadHomePage;
	this.loadMediaDetailsPage = loadMediaDetailsPage;
	this.hideLoader = hideLoader;
	this.showLoader = showLoader;
	this.disallowBodyScroll = disallowBodyScroll;
	this.allowBodyScroll = allowBodyScroll;

	NAV_ALL.forEach(element => {
		addEvent(element, 'click', () => {
			const selectedPage = document.querySelector('.page.active');
			const selectedNavigation = document.querySelector('.navigation-item.selected');
	
			if (selectedPage.id === element.dataset.navigation) {
				return;
			}
	
			if (selectedNavigation) {
				selectedNavigation.classList.remove('selected');
			}

			element.classList.add('selected');
			loadPage(element.dataset.navigation);
		});
	});

	document.querySelectorAll('[data-overlay]').forEach(element => {
		addEvent(element, 'click', () => {
			const currentActiveOverlay = document.querySelector('.page.active');
	
			if (currentActiveOverlay.id === element.dataset.overlay) {
				return;
			}
	
			showOverlay(element.dataset.overlay);
		});
	});
}();