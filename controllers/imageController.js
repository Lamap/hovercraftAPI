let Image = require('../models/imageModel');
let Tag = require('../models/tagModel');
let ObjectId = require('mongoose').Types.ObjectId;
let BadRequestError = require('../errors/bad-request');
let DbError = require('../errors/dberror');

const SRC_BASE = 'https://drive.google.com/thumbnail';

let imageFactory = (imageObject) => {
    return {
        src: SRC_BASE + '?id=' + imageObject.googleId
    }
};

module.exports = {
    getAll: (req, res, next) => {
        let query = {};
        if (req.query.tags instanceof Array && req.query.tags.length > 0) {
            query.tags = {
                $all: req.query.tags
            };
        }
        Image.find(query, (err, images) => {
            if (err) {
                next(new DbError(`Could not get images: ${err}.`));
            }
            let data = images.map((image) => {
                return imageFactory(image);
            });

            res.json(data);
        });
    },
    addTagToImage: (req, res, next) => {
        if (!ObjectId.isValid(req.params.id)) {
            return next(new BadRequestError(`Invalid image id (${req.params.id}).`));
        }

        const query = {_id: req.params.id};
        const tag = req.params.tag.toLowerCase();

        Image.findById(query, (err, image) => {
            if (err) {
                return next(new DbError(`Could not get image (${req.params.id}): ${err}.`));
            }

            if (!image) {
                return res.json({err: 'Non existing image'});
            }

            if (image.tags.indexOf(tag) !== -1) {
                return res.json(image);
            }

            image.tags.push(tag);
            image.save((err) => {
                if (err) {
                    return next(new DbError(`Could not get save image (${req.params.id}): ${err}.`));
                }

                Tag.findOne({name: tag}, (err, tagFound) => {
                    if (err) {
                        return next(new DbError(`Could not find tag (${req.params.tag}): ${err}.`));
                    }
                    if (tagFound) {
                        return res.json(image);
                    }

                    let newTag = Tag({name: tag});
                    newTag.save((err) => {
                        if (err) {
                            return next(new DbError(`Could not save tag (${req.params.tag}): ${err}.`));
                        }

                        res.json(image);
                    });
                })
            });
        })
    },
    removeTagFromImage: (req, res, next) => {
        if (!ObjectId.isValid(req.params.id)) {
            return next(new BadRequestError(`Invalid image id (${req.params.id}).`));
        }

        const query = {_id: req.params.id};
        const tag = req.params.tag.toLowerCase();

        Image.findById(query, (err, image) => {
            if (err) {
                return next(new DbError(`Could not get image (${req.params.id}): ${err}.`));
            }

            if (!image) {
                return res.json({err: 'Non existing image'});
            }
            const indexOfTag = image.tags.indexOf(tag);
            if (indexOfTag === -1) {
                return res.json({err: 'Tag does not exist on image, there is nothing to remove'});
            }

            image.tags.splice(indexOfTag, 1);

            image.save((err) => {
                if (err) {
                    return next(new DbError(`Could not save image (${req.params.id}): ${err}.`));
                }

                res.json(image);
            });
        });
    }
};