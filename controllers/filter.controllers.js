const Expense = require('../models/expense.model');

exports.filterExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, keyword } = req.query;

    // Build dynamic query
    const query = { user: req.user.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    if (keyword) {
      // search title using regex (case-insensitive)
      query.title = { $regex: keyword, $options: 'i' };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to filter expenses' });
  }
};
