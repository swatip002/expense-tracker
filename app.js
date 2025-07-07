const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const expenseRoutes = require('./routes/expense.routes');
const receiptRoutes = require('./routes/receipt.routes');
const importRoutes = require('./routes/import.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/import', importRoutes);

module.exports = app;
