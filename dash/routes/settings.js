/**
	* Settings routes for user account settings.
	* @file /routes/settings.js
	*/

'use strict';

const express = require('express');
const router = express.Router();
const { requireAuth, requireBankAuth, flashMiddleware } = require('./middleware.js');
const util = require('./util.js');
const User = require('../models/user');

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

// Apply authentication middleware to all profile routes
// xxx comment out to enter development mode WITHOUT authentication
router.use(requireAuth);
router.use(requireBankAuth);

// for our flash and redirects, we assume the user came from profile (because
// they'd have to to see account settings), so we redirect back to profile under
// that assumption.

router.post('/account/update-email', async (req, res) => {
  const { email, newEmail } = req.body;
  try {
    const ok = await User.updateEmail(email, newEmail);
    if (!ok) {
      return flashAndRedirect(req, res, 'error', 'User not found', '/profile');
    }
    flashAndRedirect(req, res, 'success', 'Email updated successfully', '/profile');
  } catch (err) {
    flashAndRedirect(req, res, 'error', 'Server error', '/profile');
  }
});

router.post('/account/update-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const ok = await User.updatePassword(email, newPassword);
    if (!ok) {
      return flashAndRedirect(req, res, 'error', 'User not found', '/profile');
    }
    flashAndRedirect(req, res, 'success', 'Password updated successfully', '/profile');
  } catch (err) {
    flashAndRedirect(req, res, 'error', 'Server error', '/profile');
  }
});

module.exports = router;

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
