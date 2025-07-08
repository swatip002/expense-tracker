const cron = require('node-cron');
const Recurring = require('../models/recurringTransaction.model');
const Expense = require('../models/expense.model');

function startRecurringJob(io) {
  cron.schedule('0 * * * *', async () => { // runs every hour
    try {
      const now = new Date();
      const due = await Recurring.find({ active: true, nextRun: { $lte: now } });

      for (let rec of due) {
        // create expense
        await Expense.create({
          user: rec.user,
          title: rec.title,
          amount: rec.amount,
          category: rec.category,
          date: now,
          source: 'recurring'
        });

        // update nextRun & lastRun
        rec.lastRun = now;
        if (rec.frequency === 'daily') rec.nextRun.setDate(rec.nextRun.getDate() + 1);
        else if (rec.frequency === 'weekly') rec.nextRun.setDate(rec.nextRun.getDate() + 7);
        else if (rec.frequency === 'monthly') rec.nextRun.setMonth(rec.nextRun.getMonth() + 1);
        else rec.nextRun.setFullYear(rec.nextRun.getFullYear() + 1);

        await rec.save();

        // emit real-time update
        io.emit('transaction_update', {
          userId: rec.user,
          amount: rec.amount,
          category: rec.category
        });
      }
      console.log(`[Recurring] Processed ${due.length} transactions`);
    } catch (err) {
      console.error('[Recurring Cron Error]', err);
    }
  });
}

module.exports = startRecurringJob;
