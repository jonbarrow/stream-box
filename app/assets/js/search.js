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

document.querySelectorAll('.search-filter').forEach(filter => {
	if (filter.classList.contains('opened')) {
		filter.classList.remove('opened');
	}
	
	const allOptions = [...filter.querySelectorAll('.filter-options .option')];
	const firstOption = allOptions[0];
	const filterValue = filter.querySelector('.filter-value');

	const lengths = allOptions.sort((a, b) => b.offsetWidth-a.offsetWidth);
	const longestTextNode = lengths[0];

	filterValue.style.width = longestTextNode.offsetWidth + 'px';
	filter.querySelector('.filter-options').style.minWidth = filter.offsetWidth + 'px';

	if (!firstOption.classList.contains('selected')) {
		firstOption.classList.add('selected');
	}

	filterValue.innerHTML = firstOption.innerHTML;

	addEvent(filter.querySelector('.filter-select'), 'click', () => {
		if (filter.classList.contains('opened')) {
			filter.classList.remove('opened');
		} else {
			const currentlyOpenedFilter = document.querySelector('.search-filter.opened');
			if (currentlyOpenedFilter) {
				currentlyOpenedFilter.classList.remove('opened');
			}

			filter.classList.add('opened');
		}
	});

	allOptions.forEach(option => {
		addEvent(option, 'click', () => {
			if (!filter.classList.contains('opened')) {
				return;
			}

			if (!option.classList.contains('selected')) {
				const currentlySelectedOption = filter.querySelector('.option.selected');
				currentlySelectedOption.classList.remove('selected');
				option.classList.add('selected');

				filterValue.dataset.optionIndex = option.dataset.index;
			}
			
			filterValue.innerHTML = option.innerText;
			filter.classList.remove('opened');

			searchMedia();
		});
	});
});