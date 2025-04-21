const express = require('express');
const campsiteRouter = express.Router();
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');
const cors = require('./cors');

// /campsites
campsiteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.find().populate('comments.author')
    .then(campsites => res.status(200).json(campsites))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.create(req.body)
    .then(campsite => res.status(201).json(campsite))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403).end('PUT operation not supported on /campsites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.deleteMany()
    .then(response => res.status(200).json(response))
    .catch(err => next(err));
});

// /campsites/:campsiteId
campsiteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId).populate('comments.author')
    .then(campsite => {
        if (campsite) res.status(200).json(campsite);
        else throw new Error('Campsite not found');
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403).end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndUpdate(req.params.campsiteId, { $set: req.body }, { new: true })
    .then(campsite => res.status(200).json(campsite))
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findByIdAndDelete(req.params.campsiteId)
    .then(result => res.status(200).json(result))
    .catch(err => next(err));
});

// /campsites/:campsiteId/comments
campsiteRouter.route('/:campsiteId/comments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId).populate('comments.author')
    .then(campsite => {
        if (campsite) res.status(200).json(campsite.comments);
        else throw new Error('Campsite not found');
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            req.body.author = req.user._id;
            campsite.comments.push(req.body);
            return campsite.save();
        } else {
            throw new Error('Campsite not found');
        }
    })
    .then(campsite => res.status(200).json(campsite))
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.status(403).end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        if (campsite) {
            campsite.comments = [];
            return campsite.save();
        } else {
            throw new Error('Campsite not found');
        }
    })
    .then(campsite => res.status(200).json(campsite))
    .catch(err => next(err));
});

// /campsites/:campsiteId/comments/:commentId
campsiteRouter.route('/:campsiteId/comments/:commentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, (req, res, next) => {
    Campsite.findById(req.params.campsiteId).populate('comments.author')
    .then(campsite => {
        const comment = campsite?.comments.id(req.params.commentId);
        if (campsite && comment) res.status(200).json(comment);
        else throw new Error('Comment or campsite not found');
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.status(403).end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        const comment = campsite?.comments.id(req.params.commentId);
        if (!campsite || !comment) throw new Error('Comment not found');
        if (!comment.author.equals(req.user._id)) {
            const err = new Error('Not authorized to update this comment');
            err.status = 403;
            return next(err);
        }
        if (req.body.rating) comment.rating = req.body.rating;
        if (req.body.text) comment.text = req.body.text;
        return campsite.save();
    })
    .then(updated => res.status(200).json(updated))
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Campsite.findById(req.params.campsiteId)
    .then(campsite => {
        const comment = campsite?.comments.id(req.params.commentId);
        if (!campsite || !comment) throw new Error('Comment not found');
        if (!comment.author.equals(req.user._id)) {
            const err = new Error('Not authorized to delete this comment');
            err.status = 403;
            return next(err);
        }
        comment.remove();
        return campsite.save();
    })
    .then(updated => res.status(200).json(updated))
    .catch(err => next(err));
});

module.exports = campsiteRouter;
