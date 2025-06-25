const express = require('express');
const cors = require('cors');
//const authRoutes = require('./routes/authRoutes');
//const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// Middleware
/*app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);*/

module.exports = app;
