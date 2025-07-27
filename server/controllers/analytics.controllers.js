const Expense = require('../models/expense.model');
const Budget = require('../models/budget.model');
const mongoose = require('mongoose');

exports.getTotalExpenses = async (req, res) => {
  try {
    const total = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ total: total[0]?.total || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get total expenses' });
  }
};

exports.getExpensesByCategory = async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } }
    ]);
    res.json(data.map(d => ({ category: d._id, total: d.total })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get category analytics' });
  }
};

exports.getMonthlyTrend = async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } }
    ]);
    res.json(data.map(d => ({
      month: `${d._id.month}-${d._id.year}`,
      total: d.total
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get monthly trend' });
  }
};

exports.getTopMerchants = async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$title", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    res.json(data.map(d => ({ merchant: d._id, total: d.total })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get top merchants' });
  }
};

exports.getCategoryWiseMonthlyTrend = async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            category: "$category",
            month: { $month: "$date" },
            year: { $year: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      {
        $project: {
          category: "$_id.category",
          month: { $concat: [{ $toString: "$_id.month" }, "-", { $toString: "$_id.year" }] },
          total: 1,
          _id: 0
        }
      },
      { $sort: { month: 1 } }
    ]);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get category-wise monthly trend' });
  }
};

exports.getTopCategoriesWithRecentExpenses = async (req, res) => {
  try {
    const topCategories = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    const categories = topCategories.map(c => c._id);

    const recentExpenses = await Expense.find({
      user: req.user.id,
      category: { $in: categories }
    }).sort({ date: -1 }).limit(10);

    res.json({
      topCategories,
      recentExpenses
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get top categories with recent expenses' });
  }
};

exports.getBudgetVsExpense = async (req, res) => {
  try {
    const { period } = req.query;
    const matchQuery = { user: new mongoose.Types.ObjectId(req.user.id) };
    if (period) matchQuery.period = period;

    const budgets = await Budget.find(matchQuery);
    const expenses = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user.id),
          ...(period && {
            $expr: {
              $eq: [
                { $concat: [{ $toString: { $month: "$date" } }, "-", { $toString: { $year: "$date" } }] },
                period
              ]
            }
          })
        }
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);

    const expenseMap = {};
    expenses.forEach(e => {
      expenseMap[e._id] = e.total;
    });

    const result = budgets.map(b => ({
      category: b.category,
      period: b.period,
      budget: b.amount,
      spent: expenseMap[b.category] || 0,
      remaining: b.amount - (expenseMap[b.category] || 0)
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to compare budget vs expense' });
  }
};

exports.getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Expense.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5)
      .select("title amount category date");

    const data = transactions.map((tx) => ({
      id: tx._id,
      merchant: tx.title,
      amount: tx.amount,
      category: tx.category,
      date: tx.date,
      type: tx.amount >= 0 ? "income" : "expense",
    }));

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get recent transactions' });
  }
};
