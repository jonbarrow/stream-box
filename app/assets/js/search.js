/* eslint-env browser */
/*
	global
		addEvent
		SEARCH_PAGE_SEARCH_INPUT
		searchMedia

*/

addEvent(SEARCH_PAGE_SEARCH_INPUT, 'keyup', ({key}) => {
	if (key === 'Enter') {
		searchMedia();
		return;
	}
});