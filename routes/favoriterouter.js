const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .populate('user')
        .populate('campsites')
        .then(favorite => res.status(200).json(favorite))
        .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                req.body.forEach(campsite => {
                    if (!favorite.campsites.includes(campsite._id)) {
                        favorite.campsites.push(campsite._id);
                    }
                });
                favorite.save()
                    .then(updated => res.status(200).json(updated))
                    .catch(err => next(err));
            } else {
                Favorite.create({ user: req.user._id, campsites: req.body.map(c => c._id) })
                    .then(favorite => res.status(200).json(favorite))
                    .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403).send('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
        .then(result => {
            if (result) {
                res.status(200).json(result);
            } else {
                res.status(200).type('text/plain').end('You do not have any favorites to delete.');
            }
        })
        .catch(err => next(err));
});

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.status(403).send('GET operation not supported on /favorites/:campsiteId');
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                if (favorite.campsites.includes(req.params.campsiteId)) {
                    res.status(200).type('text/plain').end('That campsite is already in the list of favorites!');
                } else {
                    favorite.campsites.push(req.params.campsiteId);
                    favorite.save()
                        .then(updated => res.status(200).json(updated))
                        .catch(err => next(err));
                }
            } else {
                Favorite.create({
                    user: req.user._id,
                    campsites: [req.params.campsiteId]
                })
                .then(fav => res.status(200).json(fav))
                .catch(err => next(err));
            }
        })
        .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403).send('PUT operation not supported on /favorites/:campsiteId');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
        .then(favorite => {
            if (favorite) {
                const index = favorite.campsites.indexOf(req.params.campsiteId);
                if (index >= 0) {
                    favorite.campsites.splice(index, 1);
                    favorite.save()
                        .then(updated => res.status(200).json(updated))
                        .catch(err => next(err));
                } else {
                    res.status(200).type('text/plain').end('That campsite is not in your favorites.');
                }
            } else {
                res.status(200).type('text/plain').end('You do not have any favorites to delete.');
            }
        })
        .catch(err => next(err));
});

module.exports = favoriteRouter;
