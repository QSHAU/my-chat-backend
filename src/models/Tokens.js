import User from './User.js';
import { Model } from 'objection';
import jwt from 'jsonwebtoken';
import UAParser from 'ua-parser-js';

export default class Token extends Model {
    id;
	user_id;
	access_token;
	refresh_token;
	ua;
	date_added;
	date_modified;

	static get tableName() {
		return 'tokens';
	}

	async $beforeInsert() {
		this.date_added = new Date();
	}

	async $beforeUpdate() {
		this.date_modified = new Date();
	}

	static get relationMappings() {
		return {
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: 'tokens.user_id',
					to: 'users.id',
				},
			},
		};
	}

	verifyAccessToken(option = {}) {
		return jwt.verify(this.access_token, process.env.JWT_SECRET, option);
	}

	verifyRefreshToken(option = {}) {
		return jwt.verify(this.refresh_token, process.env.REFRESH_SECRET, option);
	}

	async getUA() {
		const parser = new UAParser();
		parser.setUA(ua);
		const agent = parser.getResult();
		return JSON.stringify({ ...agent });
	}
}
