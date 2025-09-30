/**
	* Express.js middleware for Aggregate controller.
	* @file /routes/middleware.js
	*/
'use strict';

const util = require('./util');
const config = require('../config');

/**
	* Share Plaid client with other controller modules.
	*/
const PlaidClient = config.PlaidClient;

/**
 * Middleware to ensure users are authenticated before accessing protected routes
 */
function requireAuth(req, res, next) {
	if (!req.session.userId) {
		console.warn(`Unauthorized access attempt to ${req.originalUrl}`);
		return res.redirect('/login');
	}
	next();
}

/**
 * Middleware to check if user has connected a bank account
 */
function requireBankAuth(req, res, next) {
	if (!req.session.access_token) {
		console.warn(`Bank connection required for accessing ${req.originalUrl}`);
		return res.redirect('/link');
	}
	next();
}

/**
 * Central error handling middleware
 */
function errorHandler(err, req, res, next) {
	// Log the error
	console.error(`Error occurred: ${err.message}`, { 
		stack: err.stack, 
		url: req.originalUrl 
	});

	// Handle Plaid API errors
	if (err.response && err.response.data) {
		const formattedError = util.formatError(err.response);
		return res.status(err.response.status || 500).json(formattedError);
	}

	// Handle API requests with JSON response
	if (req.originalUrl.startsWith('/api')) {
		return res.status(err.status || 500).json({
			success: false,
			error: err.message || 'An unexpected error occurred'
		});
	}

	// For regular page requests, render error page
	res.status(err.status || 500).render('error', {
		title: 'Error',
		styles: ['error'],
		error: {
			message: err.message || 'An unexpected error occurred',
			status: err.status || 500,
		}
	});
}

// Middleware to check for flash messages
const flashMiddleware = (req, res, next) => {
  // Transfer flash messages from session to locals
  res.locals.flashMessages = req.session.flashMessages || {};
  // Clear flash messages for next request
  req.session.flashMessages = {};
  next();
};

module.exports = {
	requireAuth,
	requireBankAuth,
	errorHandler,
	PlaidClient,
	flashMiddleware,
};

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
