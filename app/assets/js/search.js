/* eslint-env browser */
/*
	global
		addEvent
		OVERLAY_SEARCH_BAR_INPUT
		OVERLAY_SEARCH_BAR_SPINNER
		getSearchSuggestions
		searchMedia

*/

let typingTimer;
const typingTimeoutTime = 200;

addEvent(OVERLAY_SEARCH_BAR_INPUT, 'keyup', ({key}) => {
	if (key === 'Enter') {
		searchMedia();
		return;
	}

	clearTimeout(typingTimer);

	if (OVERLAY_SEARCH_BAR_INPUT.value) {
		clearSearchSuggestions();
		OVERLAY_SEARCH_BAR_SPINNER.classList.remove('hide');
		typingTimer = setTimeout(getSearchSuggestions, typingTimeoutTime);
	}
});

function clearSearchSuggestions() {
	const currentlyLoadedSearchSuggestions = document.querySelectorAll('.search-suggestion:not(.spinner)');

	for (const currentlyloadedSearchSuggestion of currentlyLoadedSearchSuggestions) {
		currentlyloadedSearchSuggestion.parentNode.removeChild(currentlyloadedSearchSuggestion);
	}
}