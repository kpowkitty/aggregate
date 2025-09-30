/**
	* @file /routes/index.js
	*/
'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth } = require('./middleware.js');

/* Routes: */
// Static (non-auth) routes:
router.get('/', (req, res) => {
  res.render('landing-ref', {
	  title: 'Aggregate',
	  styles: ['landing', 'info'],
	  showInfo: true,
		layout: 'layouts/landing',
  });
});

router.get('/about', (req, res) => {
  res.render('about-ref', {
	  title: 'About Aggregate',
	  styles: ['about'],
		layout: 'layouts/landing',
  });
});

// NOTE: After login and link, all profile routes with require user and bank
// authentication. Our profile is dependent upon (1) the user having an
// Aggregate account and (2) the user linking at least one bank account to said
// Aggregate account.

module.exports = router;

// NOTE: All these below need to be guarded behind auth, because they're all
// part of a user's dashboard (and we should have authenticated the user in
// question).
// SEE: /routes/profile.

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
