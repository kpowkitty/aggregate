/**
	* Main server driver/bootstrap for Aggregate.
	* @file /server.js
	*/
'use strict';

// Load environment variables
require('dotenv').config();

// Core modules
const path = require('path');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

// import backend configuration
const config = require('./config.js');

// create Express.js application
const app = express();
const PORT = process.env.PORT || config.PORT;
const StaticDirectory = path.join(__dirname, 'public');

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Middleware setup:
// Static files middleware
app.use(express.static(StaticDirectory));

// Plaid requires body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'aggregate-secret-key',
  resave: false,
  saveUninitialized: false,
	// xxx do we want cookies?
	cookie: {
		secure: process.env.NODE_ENV === 'production',
		maxAge: 24 * 60 * 60 * 1000,	// 24 hours
		httpOnly: true,
		sameSite: 'lax',
	},
}));

// Database setup
if (!global.mydb) {
	global.mydb = config.DbPool;
} else {
	// xxx err, that should be unitialized
}

// Middleware to make flash messages available to all templates
app.use((req, res, next) => {
  res.locals.user = req.session.userId ? { id: req.session.userId } : null;
  next();
});

// Import each route for the main server
const index = require('./routes/index');
const auth = require('./routes/auth');
const api = require('./routes/api');
const profile = require('./routes/profile');
const settings = require('./routes/settings');

// Mount routes
// xxx conflict with auth routes and index routes, so auth takes priority over
// index
app.use('/', auth);
app.use('/', index);
app.use('/', api);
app.use('/', profile);
app.use('/', settings);

// Import error handler middleware for express
const { errorHandler } = require('./routes/middleware');
// Use error handling middleware
app.use(errorHandler);

// Finally, start server and listen to our domain.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/`);
});

// vim: set ts=2 sw=2 sts=2 noet filetype=javascript:
