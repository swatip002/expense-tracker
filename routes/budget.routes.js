const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const { setBudget, getBudget } = require('../controllers/budget.controllers');

router.use(auth);
router.post('/', setBudget);
router.get('/', getBudget);

module.exports = router;