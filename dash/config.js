/**
  * Server configuration for Aggregate backend.
  * @file /config.js
  */
'use strict';

require('dotenv').config();
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
const mysql = require('mysql2/promise');

// Express.js application configuration
const PORT = process.env.APP_PORT || 8080;

// Plaid configuration:
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_LANGAUGE = process.env.PLAID_LANGUAGE || 'en';

// PLAID_PRODUCTS is a comma-separated list of products to use when initializing
// Link. Note that this list must contain 'assets' in order for the app to be
// able to create and retrieve asset reports.
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || Products.Transactions).split(
  ',',
);

// PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
// will be able to select institutions from.
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
  ',',
);

// Set PLAID_REDIRECT_URI to 'http://localhost:3000'
// The OAuth redirect flow requires an endpoint on the developer's website
// that the bank website should redirect to. You will need to configure
// this redirect URI for your client ID through the Plaid developer dashboard
// at https://dashboard.plaid.com/team/api.
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';

// Plaid client configuration
const plaidConfig = new Configuration({
	basePath: PlaidEnvironments[PLAID_ENV],
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
			'PLAID-SECRET': PLAID_SECRET,
			'Plaid-Version': '2020-09-14',
		},
	},
});

// initialize plaid client
const plaidClient = new PlaidApi(plaidConfig);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'authdb'
};

// create a database connection pool
const dbPool = mysql.createPool(dbConfig);

module.exports = {
	PORT: PORT,
	PlaidConfig: plaidConfig,
	PlaidClient: plaidClient,
	DbConfig: dbConfig,
	DbPool: dbPool,
	PLAID_CLIENT_ID: PLAID_CLIENT_ID,
	PLAID_SECRET: PLAID_SECRET,
	PLAID_ENV: PLAID_ENV,
	PLAID_LANGAUGE: PLAID_LANGAUGE,
	PLAID_PRODUCTS: PLAID_PRODUCTS,
	PLAID_COUNTRY_CODES: PLAID_COUNTRY_CODES,
	PLAID_REDIRECT_URI: PLAID_REDIRECT_URI,
};
