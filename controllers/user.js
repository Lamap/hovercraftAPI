let User = require('../models/user');
module.exports = {
  getAll: (req, res, next) => {
    User.find(req.query, (err, users) => {
      if (err) {
        return next(err);
      }
      res.json(users);
    });
  },
  create: (req, res, next) => {
    let new_user = new User(req.body);
    new_user.save((err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    });
  },
  getOne: (req, res, next) => {
    User.findById(req.params.id, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    });
  },
  update: (req, res, next) => {
    User.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true, runValidators: true}, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    });
  },
  delete: (req, res, next) => {
    User.findOneAndRemove({ _id: req.params.id }, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    });
  }
};