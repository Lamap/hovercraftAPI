'use strict';
// import controllers
let User = require('./controllers/user');
let jwt = require('express-jwt'); // for authentication with Auth0 JWT's

// export route generating function
module.exports = app => {

  const auth = jwt({
      secret: process.env.AUTH0_SECRET,
      audience: process.env.AUTH0_ID
  });
  app.route('/test')
    .get(auth, User.getAll)
    .post(auth, User.create);
};