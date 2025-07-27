const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs/promises');
const Expense = require('../models/expense.model');
const extractTransactionDetails = require('../utils/extractTransactions');

exports.extractReceiptData = async (req, res) => {
  try {
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('Processing file:', req.file.originalname, 'Size:', req.file.size, 'Type:', req.file.mimetype);

    // Validate file type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validMimeTypes.includes(req.file.mimetype)) {
      await fs.unlink(path.join(__dirname, '..', req.file.path));
      return res.status(400).json({ error: 'Invalid file type. Please upload a JPEG or PNG image.' });
    }

    const filePath = path.join(__dirname, '..', req.file.path);
    console.log('Starting OCR processing...');
    
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: progress => {
        if (progress.status === 'recognizing text') {
          console.log(`OCR Progress: ${(progress.progress * 100).toFixed(2)}%`);
        }
      }
    });
    
    console.log('OCR completed. Extracted text length:', text.length);
    await fs.unlink(filePath);

    console.log('Starting transaction details extraction...');
    const extracted = await extractTransactionDetails(text);
    if (!extracted) {
      console.error('Gemini extraction failed - no data returned');
      return res.status(500).json({ error: 'Failed to extract transaction details from the receipt' });
    }
    console.log('Successfully extracted transaction details:', extracted);

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
