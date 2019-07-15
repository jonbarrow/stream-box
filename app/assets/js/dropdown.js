/* eslint-env browser */
/* global addEvent */

document.querySelectorAll('.dropdown').forEach(dropdown => {
	if (dropdown.classList.contains('opened')) {
		dropdown.classList.remove('opened');
	}
	
	const allOptions = [...dropdown.querySelectorAll('.dropdown-options .option')];
	const firstOption = allOptions[0];
	const dropdownValue = dropdown.querySelector('.dropdown-value');

	const lengths = allOptions.sort((a, b) => b.offsetWidth-a.offsetWidth);
	const longestTextNode = lengths[0];

	dropdownValue.style.width = longestTextNode.offsetWidth + 'px';
	dropdown.querySelector('.dropdown-options').style.minWidth = dropdown.offsetWidth + 'px';

	if (!firstOption.classList.contains('selected')) {
		firstOption.classList.add('selected');
	}

	dropdownValue.innerHTML = firstOption.innerHTML;

	addEvent(dropdown.querySelector('.dropdown-select'), 'click', event => {
		event.stopPropagation();
		
		if (dropdown.classList.contains('opened')) {
			dropdown.classList.remove('opened');
		} else {
			const currentlyOpeneddropdown = document.querySelector('.dropdown.opened');
			if (currentlyOpeneddropdown) {
				currentlyOpeneddropdown.classList.remove('opened');
			}

			dropdown.classList.add('opened');
		}
	});

	allOptions.forEach(option => {
		addEvent(option, 'click', () => {
			if (!dropdown.classList.contains('opened')) {
				return;
			}

			if (!option.classList.contains('selected')) {
				const currentlySelectedOption = dropdown.querySelector('.option.selected');
				currentlySelectedOption.classList.remove('selected');
				option.classList.add('selected');

				dropdownValue.dataset.optionIndex = option.dataset.index;
			}
			
			dropdownValue.innerHTML = option.innerText;

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
		});
	});
});

// Close dropdown when clicking anywhere on the window
document.addEventListener('click', () => {
	document.querySelectorAll('.dropdown.opened').forEach(dropdown => {
		dropdown.classList.remove('opened');
	});
});