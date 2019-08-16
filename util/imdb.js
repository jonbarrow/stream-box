const got = require('got');
const aws4 = require('aws4');

const API_BASE = 'api.imdbws.com';
const API_TEMP_CREDS = `${API_BASE}/authentication/credentials/temporary/ios85`;
const API_CREDITS = '/title/{id}/fullcredits';
const API_EPISODES = '/title/{id}/episodes';

class IMDBClient {
	constructor() {
		this._app_key = 'f46e384b-dde3-4b48-9579-77fc1bee5926';
		this._ua = 'IMDb/9.11.1 (iPhone10,6; iOS 11.4.1)';
		this.session = null;
	}

	async temporaryCredentials() {
		const {body} = await got.post(API_TEMP_CREDS, {
			json: true,
			body: {
				appKey: this._app_key
			}
		});

		this.session = body;
	}

	async _validateCredentials() {
		// Also needs to check expire time
		if (!this.session) {
			await this.temporaryCredentials();
		}
	}

	signRequest(path, method) {
		const {accessKeyId, secretAccessKey, sessionToken} = this.session.resource;

		return aws4.sign({
			signQuery: true,
			service: 'imdbapi',
			region: 'us-east-1',
			method,
			host: API_BASE,
			path: `${path}?X-Amz-Security-Token=${encodeURIComponent(sessionToken).replace(/[!'()*]/g, escape)}`
		}, {
			accessKeyId,
			secretAccessKey
		});
	}

	async _apiRequest(_path, _method='GET') {
		await this._validateCredentials();

		const {method, host, path} = this.signRequest(_path, _method);

		const {body} = await got({
			method,
			host,
			path
		}, {
			json: true
		});

		return body;
	}

	async episodes(id) {
		const {resource} = await this._apiRequest(API_EPISODES.replace('{id}', id));
		return resource;
	}

	async credits(id) {
		const {resource} = await this._apiRequest(API_CREDITS.replace('{id}', id));
		return resource.credits;
	}

	async cast(id) {
		const {cast} = await this.credits(id);
		return cast;
	}
}

module.exports = IMDBClient;