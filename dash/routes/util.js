/**
  * Utility functions for Aggregate controller.
  * @file /routes/util.js
  */
'use strict';

const util = require('util');
const config = require('../config.js');
const PlaidClient = config.PlaidClient;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const prettyPrintResponse = (res) => {
	console.log(util.inspect(res.data, {colors: true, depth: 4}));
};

/**
 * Format Plaid API errors for consistent API responses
 */
function formatError(err) {
	return {
		error: {
			status_code: err.status,
			error_code: err.data.error_code,
			error_message: err.data.error_message,
			error_type: err.data.error_type,
		}
	};
}

/**
 * Calculate a date in the past by number of days
 * @param {number} days - Number of days in the past
 * @returns {Date} Date object representing the calculated date
 */
function dateRange(days) {
	const now = new Date();
	const start = new Date(now);

	start.setDate(start.getDate() - days);

	return start;
}

/**
 * Get transactions from Plaid API
 * @param {string} atok - Access token
 * @param {Date} range - Start date for transactions
 * @returns {Promise<Object>} Transactions response from Plaid
 */
async function getTrans(atok, range) {
	try {
		const transres = await PlaidClient.transactionsGet({
			access_token: atok,
			start_date: range.toISOString().split('T')[0],
			end_date: new Date().toISOString().split('T')[0],
		});
		return transres;
	} catch (err) {
		console.error('Transactions response from Plaid failed:', err);
		throw err;
	}
}

/**
 * Get account balances from Plaid API
 * @param {string} atok - Access token
 * @returns {Promise<Object>} Balance response from Plaid
 */
async function getBal(atok)
{
	try {
		const balres = await PlaidClient.accountsBalanceGet({
			access_token: atok,
		});
		return balres;
	} catch (err) {
		console.error('Balance response from Plaid failed:', err);
		throw err;
	}
}

/**
 * Create a map of account IDs to account objects
 * @param {Object} balres - Balance response from Plaid
 * @returns {Object} Map of account IDs to account objects
 */
function getAccById(balres) {
	if (!balres || !balres.data || !balres.data.accounts) {
		console.error('Bad Plaid balance response');
		return {};
	}

	// xxx account id from plaid
	const accById = {}
	balres.data.accounts.forEach(acc => {
		accById[acc.account_id] = acc;
	});

	// xxx error handle empty accounts
	return accById;
}

// xxx
function filterTrans(transres, accById) {
	if (!transres || !transres.data || !transres.data.transactions) {
		console.err('Bad Plaid transactions response');
		return [];
	}

	let trans = transres.data.transactions;
	trans.forEach(t => {
		const acc = accById[t.account_id];
		if (acc) {
			const bal = acc.balances.current || 0;
			t.account_balance_after = bal;
			t.account_balance_before = bal + t.amount;
			t.account_mask = acc.mask;
		}
	});

	// xxx err handle
	return trans;
}

// xxx
async function fetchTrans(atok, days) {
	try {
		const range = util.dateRange(days);

		const transres = util.getTrans(atok, range);
		const balres = util.getBal(atok);
		const accById = util.getAccById(balres);
		const trans = util.filterTrans(transres);

		return trans;
	} catch (err) {
		console.err('Error fetching transactions:', err);
		throw err;
	}
}

/*
exports.listTransactions = async (req, res) => {
  const accessToken = req.session.accessToken;
  const transactions = await plaidClient.getTransactions(accessToken);
  res.render('transactions', { transactions });
};

exports.chartData = async (req, res) => {
  const accessToken = req.session.accessToken;
  const chartData = await plaidClient.getChartData(accessToken);
  res.json(chartData);
};
*/

// Helper to set flash message and redirect
/* xxx refactor into util
const flashAndRedirect = (req, res, type, message, redirectPath) => {
  // Initialize flash messages if not exists
  if (!req.session.flashMessages) {
    req.session.flashMessages = {};
  }
  // Set flash message
  req.session.flashMessages[type] = message;
  // Redirect to specified path
  res.redirect(redirectPath);
};
*/

module.exports = {
	sleep,
	prettyPrintResponse,
	formatError,
	dateRange,
	getTrans,
	getBal,
	getAccById,
	filterTrans,
	fetchTrans,
	//flashAndRedirect,
};

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
