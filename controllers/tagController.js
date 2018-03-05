let Tag = require('../models/tagModel');
let BadRequestError = require('../errors/bad-request');
let DbError = require('../errors/dberror');

module.exports = {
    getAll: (req, res, next) => {
        let query = {};
        if (typeof req.query.search === 'string' && req.query.search.length) {
            query.name = {
                $regex: req.query.search,
                $options: 'i'
            };
        }

        Tag.find(query, (err, tags) => {
            if (err) {
                next(new DbError(`Could not get tags: ${err}.`));
            }
            data = tags.map((tag) => tag.name);
            res.json(data);
        });
    }
}