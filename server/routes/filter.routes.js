const express = require('express');
const router = express.Router();
const { filterExpenses } = require('../controllers/filter.controllers');
const auth = require('../middlewares/auth.middlewares');


router.get('/', auth, filterExpenses);

module.exports = router;
