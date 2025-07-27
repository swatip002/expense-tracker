const cron = require('node-cron');
const Expense = require('../models/expense.model');
const Report = require('../models/report.model');
const genAI = require('../config/geminiClient');

async function generateReportText(expenses, period) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const categoryTotals = {};

  expenses.forEach(exp => {
    if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
    categoryTotals[exp.category] += exp.amount;
  });

  const text = `
You are an AI financial advisor.
This user spent ₹${total} during this ${period}.
Category breakdown: ${JSON.stringify(categoryTotals)}.

Generate:
1. A short summary of their spending.
2. Personalized saving tips and specify which category is most spend on.

Return as strict JSON:
{
  "summary": "...",
  "tips": "..."
}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const result = await model.generateContent(text);
  const response = result.response.text();

  try {
    return JSON.parse(response);
  } catch (err) {
    console.error("Gemini JSON parse failed:", err, response);
    return {
      summary: `Total spent: ₹${total}, by category: ${JSON.stringify(categoryTotals)}`,
      tips: "Try to save more next month."
    };
  }
}

function startReportGenerator() {
  cron.schedule('0 1 * * *', async () => {
    try {
      console.log("[Report Cron] Checking for reports...");
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const users = await Expense.distinct('user');
      for (let userId of users) {
        // weekly
        const weekExists = await Report.findOne({
          user: userId,
          period: 'weekly',
          startDate: startOfWeek
        });
        if (!weekExists) {
          const expenses = await Expense.find({
            user: userId,
            date: { $gte: startOfWeek, $lte: endOfWeek }
          });
          if (expenses.length > 0) {
            const { summary, tips } = await generateReportText(expenses, 'week');
            await Report.create({
              user: userId,
              period: 'weekly',
              startDate: startOfWeek,
              endDate: endOfWeek,
              summary,
              tips
            });
          }
        }

        // monthly
        const monthExists = await Report.findOne({
          user: userId,
          period: 'monthly',
          startDate: startOfMonth
        });
        if (!monthExists) {
          const expenses = await Expense.find({
            user: userId,
            date: { $gte: startOfMonth, $lte: endOfMonth }
          });
          if (expenses.length > 0) {
            const { summary, tips } = await generateReportText(expenses, 'month');
            await Report.create({
              user: userId,
              period: 'monthly',
              startDate: startOfMonth,
              endDate: endOfMonth,
              summary,
              tips
            });
          }
        }

        // yearly
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const endOfYear = new Date(today.getFullYear(), 11, 31);
        const yearExists = await Report.findOne({
          user: userId,
          period: 'yearly',
          startDate: startOfYear
        });
        if (!yearExists) {
          const expenses = await Expense.find({
            user: userId,
            date: { $gte: startOfYear, $lte: endOfYear }
          });
          if (expenses.length > 0) {
            const { summary, tips } = await generateReportText(expenses, 'year');
            await Report.create({
              user: userId,
              period: 'yearly',
              startDate: startOfYear,
              endDate: endOfYear,
              summary,
              tips
            });
          }
        }
      }
      console.log("[Report Cron] Done.");
    } catch (err) {
      console.error("[Report Cron Error]", err);
    }
  });
}

module.exports = startReportGenerator;
