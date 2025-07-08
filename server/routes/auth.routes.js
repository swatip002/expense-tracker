const express = require('express');
const router = express.Router();
const passport = require('passport');
const {register, login, googleAuth, updateTheme} = require('../controllers/auth.controllers');
require('../config/passport');

router.post('/register',register);
router.post('/login', login);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleAuth
);

router.patch('/theme', updateTheme);

module.exports = router;