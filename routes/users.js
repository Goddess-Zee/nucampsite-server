var express = require('express');
var router = express.Router();

const passport = require('passport');
const authenticate = require('../authenticate');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', (req, res) => {
  const user = new User({ username: req.body.username });

  User.register(user, req.body.password)
      .then(registeredUser => {
          if (req.body.firstname) {
              registeredUser.firstname = req.body.firstname;
          }
          if (req.body.lastname) {
              registeredUser.lastname = req.body.lastname;
          }
          return registeredUser.save();
      })
      .then(() => {
          passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful!' });
          });
      })
      .catch(err => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
      });
});

router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

module.exports = router;
