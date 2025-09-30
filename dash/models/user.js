/**
	* User model and DAO for Aggregate users.
	* @file /models/user.js
	*/
'use strict';

const bcrypt = require('bcrypt');

// XXX PLAID TO BE STORED IN DB:
/*
let access_token = null;	// xxx binds to user, index into other models
let user_token = null;	// xxx - we don't seem to use
let public_token = null; // xxx CAN be in memory
let item_id = null; // xxx see below, unsure
let account_id = null; // xxx api
let users = [];	// see users below
let profiles = [];
let tags = []; // xxx - depr
*/

/* DB Interactions and Structure:
Table: users
	id: int - primary key
	xxx userId: ?
	email: varchar(255) - unique secondary key
	password: varchar(255) - hashed
	created_at: timestamp
	access_token: varchar(255) - plaid access token, hashed

// xxx where does item_id go? it's a linked "item" from the plaid authentication
// xxx item_id and account_id are linked
	
Table: api
	access_token: varchar(255)
	item_id: needed
	account_id: needed

Table accounts:
	account_id: primary key

Table: profiles:
	id: xxx
*/

const config = require('../config.js');

// mock db map
if (!global.users) {
	// primary key
	global.users = new Map();

	// secondary key
	global.usersByEmail = new Map();

	// auto-increment primary key
	global.nextUserId = 1;
}

/**
 * User model
 */
class User {
	static db;

	static init(db) {
		this.db = db;
	}

  /**
   * Find a user by email
   * @param {string} email - The user's email address
   * @returns {Promise<Object|null>} - The user object or null if not found
   */
  static async findByEmail(email) {
		if (!email) {
			return null;
		}

    try {
			// Check if the email already exists
			// xxx need db
			//const [myusers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
			//if (myusers.length === 1 && myusers[0] !== null) {
			//	return myusers[0];
			//}

			const id = global.usersByEmail.get(email);
			if (!id) {
				console.log("Failed to get user id");
				return null;
			}

			const myuser = global.users.get(id);
			return myuser || null;
		} catch (err) {
      console.error(`Error finding user by email: ${err.message}`);
      throw err;
    }
  }

  /**
   * Find a user by ID
   * @param {string} id - The user's ID
   * @returns {Promise<Object|null>} - The user object or null if not found
   */
  static async findById(id) {
    try {
      // xxx db call
      // const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      // return rows.length ? rows[0] : null;
     
			// xxx impl
			const myuser = global.users.get(id);
			return myuser || null;
    } catch (err) {
      console.error(`Error finding user by ID: ${err.message}`);
      throw err;
    }
  }
 
  /**
   * Create a new user
   * @param {string} email - User's email
   * @param {string} pwd - User's password (plain text)
   * @returns {boolean} - True if created successfully, false if user already exists
   */
  static async create(email, pwd) {
    try {
			const find = await User.findByEmail(email);
			if (find !== null) {
				return false;
			}

			// XXX static variable here
			let saltRounds = 10;

			// Hash the password
			const hashed = await bcrypt.hash(pwd, saltRounds);
			console.log('hashed: %s', hashed);

			// Insert the new user into the database
			// xxx need db
			/*
			const res = await db.query(
				'INSERT INTO users (email, password, created_at) VALUES (?, ?, ?)',
				[email, hashed, new Date().toISOString()]);
			const id = res.insertId;
			*/
	
			const id = global.nextUserId++;
			const myuser = {
				id: id,
				email: email,
				password: hashed,
				created_at: new Date().toISOString(),
				access_token: null,
			};

			global.users.set(id, myuser);
			global.usersByEmail.set(email, id);

			console.log(`User created with ID: ${id}, Email: ${email}`);
			console.log(`myuser: ${myuser}`);
			return true;
		} catch (err) {
			console.error('Error creating user:', err);
			throw err;
		}
	}

	/**
	 * Set access token for a user
	 * @param {string} email - The user's email address
	 * @param {string} accessToken - The access token to set
	 * @returns {Promise<boolean>} - True if successful, false if user not found
	 */
  static async setAccessToken(id, email, accessToken) {
    try {
			let id;
			if (email) {
				const myuser = await User.findByEmail(email);
				if (myuser === null) {
					return false;
				}

				id = myuser.id;
			} else {
				id = id;
			}

			// xxx sql command
			/*
			UPDATE users SET access_token accessToken WHERE id = id;
			const res = await db.query(
				'UPDATE users SET access_token = ? WHERE id = ?',
				[accessToken, id]);
			if (!res) {
				return false;
			}
			*/

			myuser.access_token = accessToken;
			global.users.set(id, user);

			return true;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

  static async setAccessToken(email, accessToken) {
    try {
			const myuser = await User.findByEmail(email);
			if (myuser === null) {
				return false;
			}

			const id = myuser.id;

			// xxx sql command
			/*
			UPDATE users SET access_token accessToken WHERE id = id;
			const res = await db.query(
				'UPDATE users SET access_token = ? WHERE id = ?',
				[accessToken, id]);
			if (!res) {
				return false;
			}
			*/

			myuser.access_token = accessToken;
			global.users.set(id, user);

			return true;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	static async verifyPassword(email, password) {
		try {
			const myuser = await User.findByEmail(email);
			if (!myuser) {
				console.log('myuser is null');
				return null;
			}
			console.log('plaintext password: %s', password);
			console.log('myuser hashed password: %s', myuser.password);
			console.log(`myuser: ${myuser}`);

			const match = await bcrypt.compare(password, myuser.password);
			if (!match) {
				return null;
			}

			return {userId: myuser.id, accessToken: myuser.access_token};
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	static async updateEmail(email, newEmail) {
    try {
			const myuser = await User.findByEmail(email);
			if (myuser === null) {
				return false;
			}

			const id = myuser.id;

			// xxx sql command
			/*
			const [result] = await this.db.execute(
				'UPDATE users SET email = ? WHERE id = ?',
				[newEmail, id]
			);

			if (result.affectedRows == 0) {
				throw new Error('User not found.');
			}
			*/

			myuser.email = newEmail;

			global.users.set(id, user);

			return true;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	static async updatePassword(email, newPassword) {
    try {
			const myuser = await User.findByEmail(email);
			if (myuser === null) {
				return false;
			}

			const id = myuser.id;

			// xxx sql command
			/*
				const hashed = await bcrypt.hash(newPassword, saltRounds);
			const [result] = await this.db.execute(
				'UPDATE users SET password = ? WHERE id = ?',
				[hashed, id]
			);

			if (result.affectedRows == 0) {
				throw new Error('User not found.');
			}
			*/

			myuser.password = hashed;

			global.users.set(id, user);

			return true;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}
}

module.exports = User;

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
