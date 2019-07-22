/* eslint-env browser */

/*
	global
		loadHomePage
*/

//const navigationSelector = document.getElementById('navigation-selector');
//const currentSelectedSection = document.querySelector('.kb-naviation-section');
const nonLetterNumberKeys = ['Home', 'Enter', 'ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'BrowserBack', 'MediaPlayPause'];
let currentSelectedItem = document.querySelector('.kb-naviation-selected');
let textInputSelected = false;

function navigationKeyHandle(event) {
	const { key } = event;

	if (textInputSelected && !nonLetterNumberKeys.contains(key)) {
		return;
	}

	let newSelectedItemSelector;

	switch (key) {
		case 'Home':
			newSelectedItemSelector = '[data-navigation="home-page"]';
			loadHomePage();
			break;
		case 'Enter':
			currentSelectedItem.click();
			break;
		case 'ArrowRight':
			newSelectedItemSelector = currentSelectedItem.dataset.kbRight;
			break;
		case 'ArrowLeft':
			newSelectedItemSelector = currentSelectedItem.dataset.kbLeft;
			break;
		case 'ArrowDown':
			newSelectedItemSelector = currentSelectedItem.dataset.kbDown;
			break;
		case 'ArrowUp':
			newSelectedItemSelector = currentSelectedItem.dataset.kbUp;
			break;
	
		default:
			break;
	}

	if (newSelectedItemSelector) {
		let newSelectedItem;

		if (newSelectedItemSelector === 'previousElementSibling') {
			newSelectedItem = currentSelectedItem.previousElementSibling;
		} else if (newSelectedItemSelector === 'nextElementSibling') {
			newSelectedItem = currentSelectedItem.nextElementSibling;
		} else {
			newSelectedItem = document.querySelector(newSelectedItemSelector);
		}

		if (newSelectedItem) {
			currentSelectedItem.classList.remove('kb-naviation-selected');
			newSelectedItem.classList.add('kb-naviation-selected');
	
			currentSelectedItem = newSelectedItem;

			currentSelectedItem.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});

			//positionSelector();
			
		}
	}

	event.preventDefault();
}

/*
function positionSelector() {
	const { top, left } = currentSelectedItem.getBoundingClientRect();

	navigationSelector.style.top = (top - 5) + 'px';
	navigationSelector.style.left = (left - 5) + 'px';
	navigationSelector.style.width = (currentSelectedItem.offsetWidth + 10) + 'px';
	navigationSelector.style.height = (currentSelectedItem.offsetHeight + 10) + 'px';
}
*/

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {
	//positionSelector();

	this.navigationKeyHandle = navigationKeyHandle;

	document.querySelectorAll('input[type="text"]').forEach(input => {
		input.addEventListener('click', () => {
			textInputSelected = true;
		});
	});

	document.addEventListener('click', ({target}) => {
		if (target.tagName !== 'INPUT') {
			textInputSelected = false;
		}
	});
}();

/*
function nextSelectableElementRight() {
	const selectableElements = currentSelectedSection.querySelectorAll('[data-keyboard-selectable]');
	if (!selectableElements || selectableElements.length <= 0) {
		return null;
	}

	const indexOfSelectedElement = [...selectableElements].indexOf(currentSelectedItem);
	const indexOfNextSelectableElement = indexOfSelectedElement+1;
	
	return selectableElements[indexOfNextSelectableElement];
}

function nextSelectableElementLeft() {
	const selectableElements = currentSelectedSection.querySelectorAll('[data-keyboard-selectable]');
	if (!selectableElements || selectableElements.length <= 0) {
		return null;
	}

	const indexOfSelectedElement = [...selectableElements].indexOf(currentSelectedItem);
	const indexOfNextSelectableElement = indexOfSelectedElement-1;
	
	return selectableElements[indexOfNextSelectableElement];
}
*///