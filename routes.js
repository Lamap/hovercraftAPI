'use strict';
// import controllers
let User = require('./controllers/user');
let Activity = require('./controllers/activity');

// export route generating function
module.exports = app => {

  app.route('/users')
    .get(User.getAll)
    .post(User.create);

  app.route('/users/:id')
    .get(User.getOne)
    .post(User.update)
    .delete(User.delete);

  app.route('/activities')
    .get(Activity.getAll)
    .post(Activity.create);

  app.route('/activities/:id')
    .get(Activity.getOne)
    .post(Activity.update)
    .delete(Activity.delete);

};