/* eslint-env browser */

/*
	global
		loadHomePage
		virtualKeyboard
*/

const keybinds = require('../keybinds.json');
const keybindsKeys = Object.values(keybinds);
const keybindsBinds = Object.keys(keybinds);
let currentSelectedItem = document.querySelector('.kb-navigation-selected');
let textInputSelected = false;

function navigationKeyHandle(event) {
	const { key } = event;

	if (!keybindsKeys.includes(key)) {
		console.log(key);
		return;
	}

	const bind = keybindsBinds[keybindsKeys.indexOf(key)];

	if (textInputSelected && key === 'Enter') {
		return;
	}

	let newSelectedItemSelector;

	switch (bind) {
		case 'goHome':
			newSelectedItemSelector = '[data-navigation="home-page"]';
			loadHomePage();
			break;
		case 'select':
			currentSelectedItem.click();
			break;
		case 'back':
			if (virtualKeyboard.focused) {
				virtualKeyboard.delete();
			}
			break;
		case 'moveRight':
			newSelectedItemSelector = currentSelectedItem.dataset.kbRight;
			break;
		case 'moveLeft':
			newSelectedItemSelector = currentSelectedItem.dataset.kbLeft;
			break;
		case 'moveDown':
			newSelectedItemSelector = currentSelectedItem.dataset.kbDown;
			break;
		case 'moveUp':
			newSelectedItemSelector = currentSelectedItem.dataset.kbUp;
			break;
	
		default:
			console.log('Unhandled bind', bind);
			return;
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
			currentSelectedItem.classList.remove('kb-navigation-selected');
			newSelectedItem.classList.add('kb-navigation-selected');
	
			currentSelectedItem = newSelectedItem;

			currentSelectedItem.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});
		}
	}

	event.preventDefault();
}

// Get around eslint no-unused-vars, and make 100% sure the variables are global
!function() {

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