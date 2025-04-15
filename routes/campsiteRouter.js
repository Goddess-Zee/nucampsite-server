const express = require('express');
const campsiteRouter = express.Router();

const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

// =========================
// Base Route: /campsites
// =========================
campsiteRouter.route('/')
.get((req, res, next) => {
    Campsite.find()
        .populate('comments.author')
        .then(campsites => {
            res.status(200).json(campsites);
        })
        .catch(err => next(err));
});

// ==============================
// Route: /campsites/:campsiteId
// ==============================
campsiteRouter.route('/:campsiteId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            if (campsite) {
                res.status(200).json(campsite);
            } else {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
});

// ===================================================
// Route: /campsites/:campsiteId/comments (All comments)
// ===================================================
campsiteRouter.route('/:campsiteId/comments')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            if (campsite) {
                res.status(200).json(campsite.comments);
            } else {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                req.body.author = req.user._id;
                campsite.comments.push(req.body);
                return campsite.save();
            } else {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .then(campsite => {
            res.status(200).json(campsite);
        })
        .catch(err => next(err));
})
.put(authenticate.verifyUser, (req, res) => {
    res.status(403).end(`PUT not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            if (campsite) {
                for (let i = campsite.comments.length - 1; i >= 0; i--) {
                    campsite.comments.id(campsite.comments[i]._id).deleteOne();
                }
                return campsite.save();
            } else {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .then(campsite => {
            res.status(200).json(campsite);
        })
        .catch(err => next(err));
});

// ==========================================================
// Route: /campsites/:campsiteId/comments/:commentId
// ==========================================================
campsiteRouter.route('/:campsiteId/comments/:commentId')
.get((req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .populate('comments.author')
        .then(campsite => {
            if (campsite) {
                const comment = campsite.comments.id(req.params.commentId);
                if (comment) {
                    res.status(200).json(comment);
                } else {
                    const err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            } else {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .catch(err => next(err));
})
.post(authenticate.verifyUser, (req, res) => {
    res.status(403).end(`POST not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            const comment = campsite?.comments.id(req.params.commentId);
            if (campsite && comment) {
                if (comment.author.toString() !== req.user._id.toString()) {
                    const err = new Error('You are not authorized to update this comment');
                    err.status = 403;
                    return next(err);
                }
                if (req.body.rating) comment.rating = req.body.rating;
                if (req.body.text) comment.text = req.body.text;
                return campsite.save();
            } else if (!campsite) {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                const err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .then(campsite => res.status(200).json(campsite))
        .catch(err => next(err));
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
        .then(campsite => {
            const comment = campsite?.comments.id(req.params.commentId);
            if (campsite && comment) {
                if (comment.author.toString() !== req.user._id.toString()) {
                    const err = new Error('You are not authorized to delete this comment');
                    err.status = 403;
                    return next(err);
                }
                comment.remove();
                return campsite.save();
            } else if (!campsite) {
                const err = new Error(`Campsite ${req.params.campsiteId} not found`);
                err.status = 404;
                return next(err);
            } else {
                const err = new Error(`Comment ${req.params.commentId} not found`);
                err.status = 404;
                return next(err);
            }
        })
        .then(campsite => res.status(200).json(campsite))
        .catch(err => next(err));
});

module.exports = campsiteRouter;
