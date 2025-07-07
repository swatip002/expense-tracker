const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs/promises');
const Expense = require('../models/expense.model');
const extractTransactionDetails = require('../utils/extractTransactions');

exports.extractReceiptData = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = path.join(__dirname, '..', req.file.path);
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    await fs.unlink(filePath);

    const extracted = await extractTransactionDetails(text);
    if (!extracted) return res.status(500).json({ error: 'Gemini extraction failed' });

    const expense = await Expense.create({
      user: req.user.id,
      amount: extracted.amount,
      category: extracted.category,
      date: new Date(extracted.date),
      title: extracted.merchant,
      source: 'receipt'
    });

    req.app.get('io').emit('transaction_update', {
      userId: req.user.id,
      amount: extracted.amount,
      category: extracted.category
    });

    res.json({ extracted, saved: expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
};
