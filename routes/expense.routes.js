const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middlewares');
const { getExpense, addExpense, updateExpense, deleteExpense } = require('../controllers/expense.controllers');

router.use(auth);
router.get('/', getExpense);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;