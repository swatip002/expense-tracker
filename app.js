const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');
const receiptRoutes = require('./routes/receipt.routes');
const importRoutes = require('./routes/import.routes');
const budgetRoutes = require('./routes/budget.routes');
const startRecurringJob = require('./config/cron');
const analyticsRoutes = require('./routes/analytics.routes');
const recurringRoutes = require('./routes/recurringTransactions.routes');
const filterRoutes = require('./routes/filter.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
startRecurringJob();// initialize recurring jobs

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/import', importRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/filter', filterRoutes);

module.exports = app;
