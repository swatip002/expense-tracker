const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const { getReports } = require('../controllers/report.controllers');

router.get('/', auth, getReports);

module.exports = router;