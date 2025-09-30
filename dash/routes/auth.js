/**
	* Aggregate authentication controller for POST requests.
	* @file /routes/controllers/auth.js
	*/
'use strict';

const express = require('express');
const router = express.Router();
const util = require('./util.js');
const User = require('../models/user.js');
const { requireAuth, flashMiddleware } = require('./middleware.js');

router.use(flashMiddleware);

// Helper to set flash message and redirect
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


// when using user model. it will return null if it's not found. at that point
// we send our response status code here.

// Auth routes:
// GET route for login page
router.get('/login', (req, res) => {
  res.render('login-ref', {
	  title: 'Aggregate - Login',
	  styles: ['login', 'info', 'home'],
	  showInfo: true,
	  showHome: true,
		layout: 'layouts/landing',
		flashMessages: res.locals.flashMessages,
  });
});

// POST route for logging in
router.post('/login', express.urlencoded({ extended: true }), async (req, res, next) => {
	// extract email and password from request
  const { email, password } = req.body;

	// error check correct state for login POST
	if (!email || !password) {
		//return res.status(400).send('Email and password are required');
    return flashAndRedirect(req, res, 'error', 'Email and password are required', '/login');
	}

	try {
		const verify = await User.verifyPassword(email, password);

		if (!verify) {
			//return res.status(401).send('Invalid email or password');
			return flashAndRedirect(req, res, 'error', 'Invalid email or password', '/login');
		}

		req.session.userId = verify.userId;
		req.session.accessToken = verify.accessToken;

		if (!req.session.accessToken) {
			res.redirect('/link');
		} else {
			res.redirect('/profile');
		}
  } catch (err) {
    //return res.status(500).send('Error logging in');
		return flashAndRedirect(req, res, 'error', 'Error logging in. Please try again.', '/login');
  }
});

// GET route for create account page
router.get('/create', (req, res) => {
	res.render('create-ref', {
		title: 'Aggregate - Create Account',
		styles: ['login', 'info', 'home', 'create'],
		showInfo: true,
		showHome: true,
		layout: 'layouts/landing',
		flashMessages: res.locals.flashMessages,
	});
});

// POST route for creating a new account
router.post('/create', express.urlencoded({ extended: true }), async (req, res) => {
	// extract email and password from request
  const { email, password } = req.body;

	// error check correct state for login POST
	if (!email || !password) {
		//return res.status(400).send('Email and password are required');
	  return flashAndRedirect(req, res, 'error', 'Email and password are required', '/create');	
	} 

  try {
		// user already exists
		const create = await User.create(email, password);

		if (!create) {
			//return res.status(400).send('Email already exists');
			return flashAndRedirect(req, res, 'error', 'Email already exists', '/create');	
		}

		// Notify success and redirect to link page
		flashAndRedirect(req, res, 'success', 'Account created successfully!', '/link');
  } catch (err) {
		console.error('Account creation error:', err);
		return flashAndRedirect(req, res, 'error', 'Error creating account. Please try again.', '/create');
  }
});

// GET route for logout
router.get('/logout', (req, res) => {
	// clear session and redirect
  req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
		}
    res.redirect('/'); // Redirect to the landing page after logout
  });
});

// POST route for logout
router.post('/logout', express.urlencoded({ extended: true }), (req, res) => {
	// clear session and redirect
	req.session.destroy((err) => {
		if (err) {
			console.error('Error destroying session:', err);
		}
		res.redirect('/');
	});
});

// Route for link bank account page (requires user authentication):
router.get('/link', requireAuth, (req, res) => {
	// xxx do we still need these?
	// check if user is already connected
	const connected = !!req.session.access_token;

	// get profile ID if it exists in the query parameters
	const profileId = req.query.profileId || null;

	res.render('link-ref', {
	  title: 'Aggregate - Link Bank Account',
		styles: ['login', 'info', 'home', 'create'],
		connected: connected,
		profileId: profileId,
		layout: 'layouts/landing',
  });
});

module.exports = router;

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
