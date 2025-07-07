const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');
const receiptRoutes = require('./routes/receipt.routes');
const importRoutes = require('./routes/import.routes');
const budgetRoutes = require('./routes/budget.routes');
const analyticsRoutes = require('./routes/analytics.routes')

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/import', importRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/analytics', analyticsRoutes)

module.exports = app;
