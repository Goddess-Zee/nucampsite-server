const express = require('express');
const Partner = require('../models/partner');

const partnerRouter = express.Router();

partnerRouter.route('/')
.get((req, res, next) => {
    Partner.find()
    .then(partners => res.json(partners))
    .catch(err => next(err));
})
.post((req, res, next) => {
    Partner.create(req.body)
    .then(partner => res.status(201).json(partner))
    .catch(err => next(err));
})
.put((req, res) => {
    res.status(403).send('PUT not supported on /partners');
})
.delete((req, res, next) => {
    Partner.deleteMany()
    .then(result => res.json(result))
    .catch(err => next(err));
});

partnerRouter.route('/:partnerId')
.get((req, res, next) => {
    Partner.findById(req.params.partnerId)
    .then(partner => {
        if (partner) res.json(partner);
        else res.status(404).send('Partner not found');
    })
    .catch(err => next(err));
})
.post((req, res) => {
    res.status(403).send('POST not supported on /partners/:partnerId');
})
.put((req, res, next) => {
    Partner.findByIdAndUpdate(req.params.partnerId, { $set: req.body }, { new: true })
    .then(updated => res.json(updated))
    .catch(err => next(err));
})
.delete((req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
    .then(result => res.json(result))
    .catch(err => next(err));
});

module.exports = partnerRouter;
