const Expense = require('../models/expense.model');
const mongoose = require('mongoose');

exports.getTotalExpenses = async (req, res) => {
  try {
    const total = await Expense.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) }},
      { $group: { _id: null, total: { $sum: "$amount" }}}
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
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) }},
      { $group: { _id: "$category", total: { $sum: "$amount" }}},
      { $sort: { total: -1 }}
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
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) }},
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }},
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
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) }},
      { $group: { _id: "$title", total: { $sum: "$amount" }}},
      { $sort: { total: -1 }},
      { $limit: 5 }
    ]);
    res.json(data.map(d => ({ merchant: d._id, total: d.total })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get top merchants' });
  }
};
