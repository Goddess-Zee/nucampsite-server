const express = require('express');
const router = express.Router();
const passport = require('passport');
const authenticate = require('../authenticate');
const User = require('../models/user');

// Admin-only access to all users
router.get('/', authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  User.find()
  .then(users => res.status(200).json(users))
  .catch(err => next(err));
});

router.post('/signup', (req, res) => {
  const user = new User({ username: req.body.username });

  User.register(user, req.body.password)
      .then(registeredUser => {
          if (req.body.firstname) registeredUser.firstname = req.body.firstname;
          if (req.body.lastname) registeredUser.lastname = req.body.lastname;
          return registeredUser.save();
      })
      .then(() => {
          passport.authenticate('local')(req, res, () => {
              res.status(200).json({ success: true, status: 'Registration Successful!' });
          });
      })
      .catch(err => {
          res.status(500).json({ err });
      });
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.status(200).json({ success: true, token: token, status: 'You are successfully logged in!' });
});

module.exports = router;
