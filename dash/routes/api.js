/**
	* @file /routes/api.js
	*/
'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth, requireBankAuth, PlaidClient } = require('./middleware.js');
const util = require('./util.js');
const config = require('../config.js');
const User = require('../models/user.js');

// unroll plaid config from config
const PLAID_CLIENT_ID = config.PLAID_CLIENT_ID;
const PLAID_SECRET = config.PLAID_SECRET;
const PLAID_ENV = config.PLAID_ENV;
const PLAID_LANGAUGE = config.PLAID_LANGAUGE;
const PLAID_PRODUCTS = config.PLAID_PRODUCTS;
const PLAID_COUNTRY_CODES = config.PLAID_COUNTRY_CODES;
const PLAID_REDIRECT_URI = config.PLAID_REDIRECT_URI;

// Apply authentication middleware to all Plaid API routes
router.use(requireAuth);

global.item_id;

// create a Link token and return it
router.post('/api/create_link_token', function (req, res, next) {
	Promise.resolve()
		.then(async function() {
			const cfg = {
				user: {
					// unique id for the current user
					client_user_id: req.sessionID,
				},
				client_name: 'Aggregate',
				products: PLAID_PRODUCTS,
				country_codes: PLAID_COUNTRY_CODES,
				language: 'en',
			};

			if (PLAID_REDIRECT_URI !== '') {
				cfg.redirect_uri = PLAID_REDIRECT_URI;
			}

			const tokres = await PlaidClient.linkTokenCreate(cfg);
			util.prettyPrintResponse(tokres);
			res.json(tokres.data);
		})
		.catch(next);
});

// exchange the public token from Plaid Link for an access token
router.post('/api/exchange_public_token', async (req, res, next) => {
	try {
    if (!req.body.public_token) {
      return res.status(400).json({
        success: false,
        error: 'Missing public token'
      });
    }

    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

		const exchangeRes = await PlaidClient.itemPublicTokenExchange({
			public_token: req.body.public_token,
		});

		// xxx also *maybe* store in db
		req.session.itemId = exchangeRes.data.item_id;

		// XXX STORE IN DB
		req.session.accessToken = exchangeRes.data.access_token;
		const result =
			User.setAccessToken(req.session.userId, null, req.session.accessToken);

    if (!result) {
      console.error(`Failed to store access token for user ${userId}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to store access token'
      });
    }	

		res.json({ success: true });
	} catch (err) {
		next(err);
	}
});

// fetch balance data using the Node client library for Plaid
router.get('/api/data', async (req, res, next) => {
	try {
		const atok = req.session.accessToken;
		if (!atok) {
			return res.status(400).json({error: 'No access token found'});
		}

		const balanceResponse = await PlaidClient.accountsBalanceGet({
			access_token: atok,
		});
		res.json({
			success: true,
			Balance: balanceResponse.data,
		});
	} catch (err) {
		next(err);

		// xxx handle common Plaid errors
	}
});

// check whether the user's account is connected
router.get('/api/is_account_connected', async (req, res, next) => {
	return (req.session.accessToken
		? res.json({ status: true})
		: res.json({ status: false }));
});

/**
 * Global error handler for API routes
 */
router.use('/api', (err, req, res, next) => {
  console.error('API Error:', err);
  
  // Handle Plaid API errors
  if (err.response && err.response.data) {
    const plaidError = err.response.data;
		util.prettyPrintResponse(err.response);

		// xxx util.formatError ?
    return res.status(err.response.status || 500).json({
      success: false,
      error: plaidError.error_message || 'An error occurred with the financial service',
      error_code: plaidError.error_code,
      error_type: plaidError.error_type
    });
  }
  
  // Handle other errors
  res.status(500).json({
    success: false,
    error: err.message || 'An unexpected error occurred'
  });
});

router.post('/api/info', async function (req, res, next) {
	try {
		const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

		const myuser = await User.findById(req.session.userId);
		if (!myuser || !myuser.access_token) {
			return res.status(404).json({
        success: false,
        error: 'User not found'
      });
		}

		// req.session.accessToken

		// xxx item_id

		res.json({
			item_id: myuser.item_id || req.session.itemId,
			access_token: myuser.access_token || req.session.accessToken,
			products: PLAID_PRODUCTS,
		});
		} catch (err) {
			console.error("Error with /api/info");
			throw err;
		}
});

router.post('/api/profile/remove-card', async (req, res) => {
	try {
		const id = req.session.userId;
		if (!id) {
			console.error('Invalid user ID: %s. Redirecting to login...', id);
			return res.redirect('/login');
		}

		const atok = req.session.accessToken;
		if (!atok) {
			console.error(
				'Invalid Plaid access token: %d. Redirecting to link...', atok);
			return res.redirect('/link');
			// xxx show error and redirect
		}

		const {cardId} = req.body;

		// xxx handle logic for filtering out plaid cards

		res.json({success: true});
	} catch (err) {
		console.error('Error removing card:', err);
		res.status(500).json({success: false, error: 'Server error'});
	}
});

router.post('/api/profile/add-card', async (req, res) => {
  try {
		const id = req.session.userId;
		if (!id) {
			console.error('Invalid user ID: %s. Redirecting to login...', id);
			return res.redirect('/login');
		}

		const atok = req.session.accessToken;
		if (!atok) {
			console.error(
				'Invalid Plaid access token: %d. Redirecting to link...', atok);
			return res.redirect('/link');
		}

		const {cardId} = req.body;

		const balres = await PlaidClient.accountsBalanceGet({
			access_token: atok,
		});

		const cardInfo = balres.data.accounts.find(acc => acc.account_id === cardId);
		if (!cardInfo) {
		  return res.status(404).json({success: false, error: 'Card not found'});
		}

		return res.json({success: true});
  } catch (err) {
	console.error('Error adding card:', err);
		return res.status(500).json({success: false, error: 'Server error'});
  }
});

module.exports = router;

//<!-- vim: set ts=2 sw=2 sts=2 noet filetype=javascript: -->
