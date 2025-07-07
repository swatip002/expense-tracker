const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const {
  getTotalExpenses,
  getExpensesByCategory,
  getMonthlyTrend,
  getTopMerchants
} = require('../controllers/analytics.controllers');

router.get('/total', auth, getTotalExpenses);
router.get('/categories', auth, getExpensesByCategory);
router.get('/monthly', auth, getMonthlyTrend);
router.get('/merchants', auth, getTopMerchants);

module.exports = router;
