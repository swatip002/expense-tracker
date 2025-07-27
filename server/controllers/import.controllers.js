const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const xlsx = require('xlsx');
const Expense = require('../models/expense.model');
const extractTransactionDetails = require('../utils/extractTransactions');

exports.importTransactions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    let transactions = [];

    if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true, skip_empty_lines: true }))
          .on('data', (row) => results.push(row))
          .on('end', () => { transactions = results; resolve(); })
          .on('error', (err) => reject(err));
      });
    } else if (ext === '.xlsx') {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      transactions = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return res.status(400).json({ error: 'Unsupported file format' });
    }

    let insertedCount = 0;
    let failedRows = [];
    
    for (let [index, tx] of transactions.entries()) {
      try {
        const rawText = tx.Description || tx.Remark || tx['Transaction Details'] || JSON.stringify(tx);
        const extracted = await extractTransactionDetails(rawText);
        
        if (!extracted) {
          failedRows.push({ row: index + 1, reason: 'Failed to extract transaction details' });
          continue;
        }

        if (!extracted.amount) {
          failedRows.push({ row: index + 1, reason: 'Invalid amount in transaction' });
          continue;
        }

        await Expense.create({
          user: req.user.id,
          amount: extracted.amount,
          category: extracted.category,
          date: new Date(extracted.date),
          title: extracted.merchant,
          source: 'upi_csv'
        });

        req.app.get('io').to(req.user.id).emit('transaction_update', {
          userId: req.user.id,
          amount: extracted.amount,
          category: extracted.category
        });

        insertedCount++;
      } catch (error) {
        failedRows.push({ row: index + 1, reason: error.message });
      }
    }

    fs.unlinkSync(filePath);
    res.json({
      message: 'Import completed',
      success: insertedCount,
      failed: failedRows.length,
      failedDetails: failedRows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to import transactions' });
  }
};
