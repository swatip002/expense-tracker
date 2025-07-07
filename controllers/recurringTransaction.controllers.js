const Recurring = require('../models/recurringTransaction.model');

exports.createRecurring = async (req, res) => {
  try {
    const { title, amount, category, frequency } = req.body;
    const nextRun = new Date();

    // adjust nextRun for frequency
    if (frequency === 'weekly') nextRun.setDate(nextRun.getDate() + 7);
    else if (frequency === 'monthly') nextRun.setMonth(nextRun.getMonth() + 1);
    else if (frequency === 'yearly') nextRun.setFullYear(nextRun.getFullYear() + 1);
    else nextRun.setDate(nextRun.getDate() + 1);

    const recurring = await Recurring.create({
      user: req.user.id,
      title,
      amount,
      category,
      frequency,
      nextRun
    });

    res.json(recurring);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
};

exports.getRecurring = async (req, res) => {
  try {
    const data = await Recurring.find({ user: req.user.id });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
};

exports.toggleRecurring = async (req, res) => {
  try {
    const recurring = await Recurring.findById(req.params.id);
    if (!recurring) return res.status(404).json({ error: 'Not found' });

    recurring.active = !recurring.active;
    await recurring.save();

    res.json(recurring);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle' });
  }
};
