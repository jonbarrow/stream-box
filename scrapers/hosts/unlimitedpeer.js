const got = require('got');

const REGEX = /urlVideo = '(.*?)'/;

async function scrape(embedURL) {
	const {body} = await got(embedURL);

	const regexData = REGEX.exec(body);
	if (!regexData || !regexData[1]) {
		return null;
	}

	return regexData[1];
}

module.exports = {
	scrape
};

/*
(async () => {
	const stream = await scrape('https://unlimitedpeer.ru/embed/Rjh6OWI2VEYvaXppbWFsWDl4QUR4RmZ1MWExRG1acUt4UXpFYVpJWkxmbjI0dUlYVUJJM0VUZFFkRXpYSjg5TQ%3D%3D');
	console.log(stream);
})();
*/