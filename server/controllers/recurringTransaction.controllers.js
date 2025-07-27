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

// Update a recurring transaction
exports.updateRecurring = async (req, res) => {
  try {
    const updated = await Recurring.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        amount: req.body.amount,
        frequency: req.body.frequency,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Recurring transaction not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a recurring transaction
exports.deleteRecurring = async (req, res) => {
  try {
    const deleted = await Recurring.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Recurring transaction not found" });
    }
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

