// import libraries
let exp = require('express');     // to set up an express app
let jwt = require('express-jwt'); // for authentication with Auth0 JWT's
let bp  = require('body-parser'); // for parsing JSON in request bodies
let mng = require('mongoose');    // for interacting with MongoDB

// import Error classes
// NOTE: UnauthorizedError is built into express-jwt
let BadRequestError    = require('./errors/bad-request');
let ForbiddenError     = require('./errors/forbidden');
let RouteNotFoundError = require('./errors/route-not-found');

// load environment variables
require('dotenv').config();

// connect to MongoDB
mng.Promise = global.Promise
mng.connect(process.env.CONNECTION);

// initialize app
let app = exp();

/**
 * Preflight Middleware
 */
// CORS
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  //intercepts OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
});
// public routes
let publicRoutes = require('./publicRoutes');
publicRoutes(app);

// auth0 JWT; reject requests that aren't authorized
// client ID and secret should be stored in a .env file
app.use(jwt({
  secret: process.env.AUTH0_SECRET,
  audience: process.env.AUTH0_ID
}));

// parse JSON in the body of requests
app.use(bp.json());

// authenticated routes

let routes = require('./routes');
routes(app);

/**
 * Postflight Middleware
 */
// handle 404's
app.use((req, res, next) => {
  next(new RouteNotFoundError(`You have tried to access an API endpoint (${req.url}) that does not exist.`));
});

// handle errors (404 is not technically an error)
app.use((err, req, res, next) => {
  switch(err.name) {
    case 'BadRequestError':
      res.status(400).json({ name: err.name, message: err.message });
      break;
    case 'UnauthorizedError':
      res.status(401).json(err);
      break;
    case 'ForbiddenError':
      res.status(403).json({ name: err.name, message: err.message });
      break;
    case 'RouteNotFoundError':
      res.status(404).json({ name: err.name, message: err.message });
      break;
    default:
      res.status(400).json(err);
  }
});

// export for testing
module.exports = app;