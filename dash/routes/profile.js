/**
	* Profile routes AFTER user and bank authentication.
	* @file /routes/profile.js
	*/

// NOTE: At the point we're allowing access to the profile routes, we assume (1)
// the user is logged-in to an Aggregate account and (2) the user has linked at
// least one bank account via Plaid.

'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth, requireBankAuth, plaidClient } = require('./middleware.js');
const util = require('./util.js');

// Apply authentication middleware to all profile routes
// xxx comment out to enter development mode WITHOUT authentication
//router.use(requireAuth);
//router.use(requireBankAuth);

/* Utility functions: BEGIN */
// /profile:profileId

/* xxx make sure no data is missing from these procedures
const transres = util.getTrans(atok, range);
const balres = util.getBal(atok);
const accById = util.getAccById(balres);
const trans = util.filterTrans(transres);
*/

/**
	* Sort transactions by different criteria.
	* @pre id and atok are validated.
	*/
async function sort(id, atok, pred) {
	// get transaction data from plaid
	// from a date range
	// xxx static variable here
	const days = 30
	const range = util.dateRange(days);

	const transres = await util.getTrans(atok, range);
	const balres = await util.getBal(atok);
	const accById = util.getAccById(balres);
	const trans = util.filterTrans(transres, accById);

	// xxx if account mask is unavailable, then assign it to the known mask
	//transaction.account_id ? transaction.account_id.slice(-4)

	switch (pred) {
		case 'date-asc':
			trans.sort((a, b) => new Date(a.date) - new Date(b.date));
			break;
		case 'date-desc':
			trans.sort((a, b) => new Date(b.date) - new Date(a.date));
			break;
		case 'amount-asc':
			trans.sort((a, b) => Math.abs(a.amount) - Math.abs(b.amount));
			break;
		case 'amount-desc':
			trans.sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
			break;
		case 'category':
			trans.sort((a, b) => {
				const catA = a.category ? a.category[0] : '';
				const catB = b.category ? b.category[0] : '';
				return catA.localeCompare(catB);
			});
			break;
		default:
			// default to date-desc if invalid sort predicate
			trans.sort((a, b) => new Date(b.date) - new Date(a.date));
	}

	return trans;
}

/**
	* Get unique merchant names from transactions.
	* @pre id and atok are validated.
	*/
function getMerch(id, atok, trans)
{
	const merch = [...new Set(trans.map(t => t.merchant_name || t.name ))];

	return merch;
}

/**
	* Get available cards (credit and debit accounts).
	* @pre id and atok are validated.
	*/
async function getCards(id, atok) {
	const balres = await util.getBal(atok);

	// get available cards
	const cards = balres.data.accounts
		.filter(acc => acc.type === 'credit' || acc.type === 'depository')
		.map(acc => ({
			id: acc.account_id,
			mask: acc.mask,
			name: acc.name,
		}));

	return cards;
}
/* Utility functions: END */

/**
	* Main profile route.
	*/
router.get('/profile', async (req, res) => {
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

		// default to date-desc if sort predicate not supplied
		const pred = req.query.sort || 'date-desc';

		const trans = await sort(id, atok, pred);
		const cards = await getCards(id, atok);
		const merch = getMerch(id, atok, trans);

  	return res.render('profile-ref', {
			title: 'Aggregate - Finance Dashboard',
			styles: ['profile'],
			trans: trans,
			cards: cards,
			merch: merch,
			sort: pred,
		});
	} catch (err) {
		console.error('Error rendering profile page:', err);
		return res.status(500).send('Server error');
	}
});

/**
	* User settings page.
	*/
router.get('/settings', (req, res) => {
  res.render('settings-ref', {
		title: 'Aggregate - Settings',
		styles: ['settings', 'profile'],
	});
});

/**
  * User stocks page.
	*/
router.get('/stock', (req, res) => {
  res.render('stock-ref', {
		title: 'Aggregate - Stocks',
		styles: ['stock', 'profile'],
	});
});

// req.session:
// userId
// accessToken
// look up in db

module.exports = router;

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
