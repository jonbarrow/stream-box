class ScrapeMovieError extends Error {
	constructor(id, reason, status) {
		const message = `Failed to scrape ${id}
		${reason}\n`;

		super(message);

		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
		this.status = status || 500;
	}
}

module.exports = ScrapeMovieError;