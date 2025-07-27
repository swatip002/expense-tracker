const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const { setBudget, getBudget, deleteBudget } = require('../controllers/budget.controllers');

router.use(auth);
router.post('/', setBudget);
router.get('/', getBudget);
router.delete('/:category/:period', deleteBudget)

module.exports = router;