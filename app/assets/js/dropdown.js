/* eslint-env browser */
/* global addEvent */

const crypto = require('crypto');

document.querySelectorAll('.dropdown').forEach(dropdown => {
	const dropdownSelect = dropdown.querySelector('.dropdown-select');

	addEvent(dropdown.querySelector('.dropdown-select'), 'click', event => {
		event.stopPropagation();
		
		if (dropdown.classList.contains('opened')) {
			dropdown.classList.remove('opened');
			dropdownSelect.dataset.kbDown = dropdownSelect.dataset.kbDownOriginal;
		} else {
			dropdownSelect.dataset.kbDownOriginal = dropdownSelect.dataset.kbDown;
			dropdownSelect.dataset.kbDown = `.dropdown-select[data-dropdown-id="${dropdownId}"] + .dropdown-options .option`;
			const currentlyOpeneddropdown = document.querySelector('.dropdown.opened');
			if (currentlyOpeneddropdown) {
				currentlyOpeneddropdown.classList.remove('opened');
			}

			dropdown.classList.add('opened');
		}
	});

	const dropdownId = crypto.randomBytes(5).toString('hex');
	dropdownSelect.dataset.dropdownId = dropdownId;

	if (dropdown.classList.contains('opened')) {
		dropdown.classList.remove('opened');
	}
	
	const allOptions = [...dropdown.querySelectorAll('.dropdown-options .option')];
	const firstOption = allOptions[0];
	const dropdownValue = dropdown.querySelector('.dropdown-value');

	const lengths = allOptions.sort((a, b) => b.offsetWidth-a.offsetWidth);
	const longestTextNode = lengths[0];

	if (!longestTextNode) { // No options
		return;
	}

	dropdownValue.style.width = longestTextNode.offsetWidth + 'px';
	dropdown.querySelector('.dropdown-options').style.minWidth = dropdown.offsetWidth + 'px';

	if (!firstOption.classList.contains('selected')) {
		firstOption.classList.add('selected');
	}

	dropdownValue.innerHTML = firstOption.innerHTML;

	allOptions.forEach(option => {
		option.dataset.kbUp = 'previousElementSibling';
		option.dataset.kbDown = 'nextElementSibling';
	});

	firstOption.dataset.kbUp = `.dropdown-select[data-dropdown-id="${dropdownId}"]`;
});

// Close dropdown when clicking anywhere on the window
document.addEventListener('click', ({target}) => {
	if (target.tagName === 'SPAN' && target.classList.contains('option')) {
		const dropdown = target.parentElement.parentElement;
		const dropdownSelect = dropdown.querySelector('.dropdown-select');
		const dropdownValue = dropdown.querySelector('.dropdown-value');

		if (!dropdown.classList.contains('opened')) {
			return;
		}

		if (!target.classList.contains('selected')) {
			const currentlySelectedOption = dropdown.querySelector('.option.selected');
			currentlySelectedOption.classList.remove('selected');
			target.classList.add('selected');

			dropdownValue.dataset.optionIndex = target.dataset.index;
		}
		
		dropdownValue.innerHTML = target.innerText;

		if (dropdown.dataset.onchange) {
			if (dropdown.dataset.onchange.endsWith(')') || dropdown.dataset.onchange.endsWith(';')) {
				// If we have the function as inline code
				setTimeout(dropdown.dataset.onchange, 1); // runs code inline from a string without eval or 'new Function()'
			} else {
				// If we have the function as just the name
				const onChange = window[dropdown.dataset.onchange];
				if(onChange && typeof onChange === 'function') {
					onChange();
				}
			}
		}

		if (target.classList.contains('kb-navigation-selected')) {
			currentSelectedItem = target.parentElement.parentElement.querySelector('.dropdown-select');
			target.classList.remove('kb-navigation-selected');
			currentSelectedItem.classList.add('kb-navigation-selected');
		}

		dropdownSelect.dataset.kbDown = dropdownSelect.dataset.kbDownOriginal;
	}

	document.querySelectorAll('.dropdown.opened').forEach(dropdown => {
		dropdown.classList.remove('opened');
	});
});