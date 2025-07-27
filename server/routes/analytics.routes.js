const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const {
  getTotalExpenses,
  getExpensesByCategory,
  getMonthlyTrend,
  getTopMerchants,
  getCategoryWiseMonthlyTrend,
  getTopCategoriesWithRecentExpenses,
  getBudgetVsExpense,
  getRecentTransactions
} = require('../controllers/analytics.controllers');

router.use(auth);
router.get('/total',  getTotalExpenses);
router.get('/category',  getExpensesByCategory);
router.get('/monthly',  getMonthlyTrend);
router.get('/top-merchants',  getTopMerchants);
router.get('/monthly-category',  getCategoryWiseMonthlyTrend);
router.get('/top-category-recent',  getTopCategoriesWithRecentExpenses);
router.get('/budget-vs-expense',  getBudgetVsExpense);
router.get('/recent',  getRecentTransactions);



module.exports = router;
