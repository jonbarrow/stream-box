// Used to request the webpage
const got = require('got');

// RegEx to find the required parts
const ENCODED_SIGNATURE_REGEX = /<p (?:id=".*"|style="") (?:style=""|id=".*")>(.*)<\/p>/; // Doing this allows us to skip needing to use RegEx to find the AAEncoded JavaScript, decode it, and then use RegEx 2 more times to find this same value. This saves quite a bit of time. However this relies on a static HTML structure which may change
const SEED_1_REGEX = /\(_0x30725e,(.*)\),_1x4bfb36\)/;
const SEED_2_REGEX = /_1x4bfb36=(.*?);/;

async function scrape(url) {
	// Get the webpage
	const response = await got(url); // No idea if this works for all OpenLoad sites, there's a TON of them
	const body = response.body;

	// Dirty check to see if the file exists
	if (body.includes('It maybe got deleted by the owner or was removed due a copyright violation')) {
		return null;
	}

	return parse(body);
}

function parse(body) {
	// Find the seeds and encoded signature
	const ENCODED_SIGNATURE_REGEX_DATA = ENCODED_SIGNATURE_REGEX.exec(body);
	const SEED_1_REGEX_DATA = SEED_1_REGEX.exec(body);
	const SEED_2_REGEX_DATA = SEED_2_REGEX.exec(body);

	if (!ENCODED_SIGNATURE_REGEX_DATA || !SEED_1_REGEX_DATA || !SEED_2_REGEX_DATA) {
		if (!ENCODED_SIGNATURE_REGEX_DATA) console.log('[ERROR] Failed to find Encoded Signature!');
		if (!SEED_1_REGEX_DATA) console.log('[ERROR] Failed to find Seed A!');
		if (!SEED_2_REGEX_DATA) console.log('[ERROR] Failed to find Seed B!');
		return null;
	}

	const ENCODED_SIGNATURE = ENCODED_SIGNATURE_REGEX_DATA[1];
	// The seeds are provided as the results of math operations, so they need to be evaluated before they can be used
	// They also change periodically, but not often. So we must find them to make sure they are the latest seeds
	const SEED_1 = eval(SEED_1_REGEX_DATA[1]);
	const SEED_2 = eval(SEED_2_REGEX_DATA[1]);

	let signature = ''; // This will be populated with the signature

	/*
		This is where the signature decoding starts
		The variables need better names, and I'm sure most of this can be cleaned up/simplified
		I am still unsure as to what exact algorithm is being used here, so most of the variable names are temp/guesses
	*/

	const ENCODED_SIGNATURE_STARTED = ENCODED_SIGNATURE.substring(0, 72); // This seems to contain IVs of some sort?
	const ENCODED_SIGNATURE_END = ENCODED_SIGNATURE.substring(72); // This seems to contain the real encoded signature
	const iv_array = []; // Seems like IVs?

	// seems like it gets the IVs from the first part of the string?
	for (let i = 0; i < ENCODED_SIGNATURE_STARTED.length; i += 8) {
		const IV = ENCODED_SIGNATURE_STARTED.substring(i, i + 8);
		iv_array.push(parseInt(IV, 16));
	}

	let iv_index = 0;

	for (let i = 0; i < ENCODED_SIGNATURE_END.length;) {
		// I have no idea what these mean right now
		let unknown_2 = 0;
		let unknown_3 = 0;
		let unknown_4 = 0;

		do {
			const unknown_5 = ENCODED_SIGNATURE_END.substring(i, (i + 2)); // gets the next set of 2 characters from the string
			unknown_4 = parseInt(unknown_5, 16); // convert the HEX string to a number

			// Not entirely sure what the point of all this is atm
			const unknown_6 = unknown_4 & 63;

			if (unknown_3 < 30) {
				unknown_2 += unknown_6 << unknown_3;
			} else {
				unknown_2 += unknown_6 * Math.pow(2, unknown_3);
			}

			unknown_3 += 6;
			i += 2;
		} while (unknown_4 >= 64);

		// oh hey look this works
		let IV = unknown_2 ^ iv_array[iv_index % 9];
		IV = (IV ^ SEED_2) ^ SEED_1;
		let unknown_8 = 255;

		for (let j = 0; j < 4; j++) {
			const charcode = ((IV & unknown_8) >> (8 * j)) - 1;
			const character = String.fromCharCode(charcode);
			if (character != '$') {
				signature += character;
			}
			unknown_8 = unknown_8 << 8;
		}

		iv_index++;
	}

	return `https://openload.co/stream/${signature}`;
}

/*
(async () => {
	const stream = await scrape('https://openload.co/embed/J5-Dpu9CY8A/');
	console.log(stream);
})();
*/

module.exports = {
	scrape
};