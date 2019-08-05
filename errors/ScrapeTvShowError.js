class ScrapeTvShowError extends Error {
	constructor(id, season, episode, reason, status) {
		const message = `Failed to scrape S${season}:E${episode} of ${id}
		${reason}\n`;

		super(message);

		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
		this.status = status || 500;
	}
}

module.exports = ScrapeTvShowError;