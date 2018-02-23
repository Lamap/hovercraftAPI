let Activity = require('../models/activity');
module.exports = {
  getAll: (req, res, next) => {
    Activity.find(req.query, (err, activities) => {
      if (err) {
        return next(err);
      }
      res.json(activities);
    });
  },
  create: (req, res, next) => {
    let new_activity = new Activity(req.body);
    new_activity.save((err, activity) => {
      if (err) {
        return next(err);
      }
      res.json(activity);
    });
  },
  getOne: (req, res, next) => {
    Activity.findById(req.params.id, (err, activity) => {
      if (err) {
        return next(err);
      }
      res.json(activity);
    });
  },
  update: (req, res, next) => {
    Activity.findOneAndUpdate({ _id: req.params.id }, req.body, {new: true, runValidators: true}, (err, activity) => {
      if (err) {
        return next(err);
      }
      res.json(activity);
    });
  },
  delete: (req, res, next) => {
    Activity.findOneAndRemove({ _id: req.params.id }, (err, activity) => {
      if (err) {
        return next(err);
      }
      res.json(activity);
    });
  }
};