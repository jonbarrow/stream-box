/* eslint-env browser */

const EventEmitter = require('events').EventEmitter;

class VirtualKeyboard extends EventEmitter {
	constructor(element) {
		super();

		this.keyboard_element = element;
		this.selected_input = null;
		this.shifted = false;
		this.focused = false;
		this.pos = 0;

		this.keyboard_element.addEventListener('click', this.keyPress.bind(this), true);
	}

	focus(element) {
		this.keyboard_element.classList.remove('hidden');
		this.selected_input = element;

		this.focused = true;

		this.selected_input.classList.remove('navigation-selected');
		this.keyboard_element.querySelector('[data-key]').classList.add('navigation-selected');
	}

	unfocus() {

		this.focused = false;

		this.keyboard_element.classList.add('hidden');
		this.keyboard_element.querySelector('.navigation-selected').classList.remove('navigation-selected');
		this.selected_input.classList.add('navigation-selected');

		this.emit('close');
	}

	keyPress(event) {
		const target = event.target;

		target.classList.add('keyboard-key-flash');
		setTimeout(() => {
			target.classList.remove('keyboard-key-flash');
		}, 100);
		
		if (target.getAttribute('id') === 'key-return') {
			this.emit('return');
			this.unfocus();
			return;
		} else if (target.getAttribute('id') === 'key-backspace') {
			this.delete();
			return;
		} else if (target.getAttribute('id') === 'key-shift') {
			this.shift();
			return;
		}

		let key = target.getAttribute('data-key');
		if (this.shifted) {
			key = target.getAttribute('data-key-shifted');
		}

		this.type(key);
	}

	movePositionLeft() {
		this.pos = this.selected_input.selectionStart;
		if (this.pos) {
			this.pos--;
			this.selected_input.setSelectionRange(this.pos, this.pos);
		}
	}

	movePositionRight() {
		this.pos = this.selected_input.selectionStart;
		this.pos++;
		this.selected_input.setSelectionRange(this.pos, this.pos);
	}

	type(string) {
		this.pos = this.selected_input.selectionStart;

		const val = this.selected_input.value;
		const start = val.substring(0, this.pos);
		const end = val.substring(this.pos);

		this.pos++;

		this.selected_input.value = start + string + end;
		this.selected_input.setSelectionRange(this.pos, this.pos);
	}

	delete() {
		this.pos = this.selected_input.selectionStart;

		const val = this.selected_input.value;
		const start = val.substring(0, this.pos);
		const end = val.substring(this.pos);

		this.pos--;

		this.selected_input.value = start.slice(0, -1) + end;
		this.selected_input.setSelectionRange(this.pos, this.pos);

		if (this.pos <= -1) {
			this.unfocus();
		}
	}

	shift() {
		this.shifted = !this.shifted;

		const keys = this.keyboard_element.querySelectorAll('[data-key]');
		for (const key of keys) {
			let display_key = key.getAttribute('data-key');
			if (this.shifted) {
				display_key = key.getAttribute('data-key-shifted');
			}

			if (display_key && display_key.trim().length >= 1) {
				key.innerHTML = display_key;
			}
		}
	}
}

module.exports = VirtualKeyboard;