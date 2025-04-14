const express = require('express');
const Promotion = require('../models/promotion');

const promotionRouter = express.Router();

promotionRouter.route('/')
.get((req, res, next) => {
    Promotion.find()
    .then(promotions => res.json(promotions))
    .catch(err => next(err));
})
.post((req, res, next) => {
    Promotion.create(req.body)
    .then(promo => res.status(201).json(promo))
    .catch(err => next(err));
})
.put((req, res) => {
    res.status(403).send('PUT not supported on /promotions');
})
.delete((req, res, next) => {
    Promotion.deleteMany()
    .then(result => res.json(result))
    .catch(err => next(err));
});

promotionRouter.route('/:promotionId')
.get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
    .then(promo => {
        if (promo) res.json(promo);
        else res.status(404).send('Promotion not found');
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.status(403).send('POST not supported on /promotions/:promotionId');
})
.put((req, res, next) => {
    Promotion.findByIdAndUpdate(req.params.promotionId, { $set: req.body }, { new: true })
    .then(updated => res.json(updated))
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Promotion.findByIdAndDelete(req.params.promotionId)
    .then(result => res.json(result))
    .catch(err => next(err));
});

module.exports = promotionRouter;
