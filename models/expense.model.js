const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: { 
        type: String, 
        required: true
     },
    amount: { 
        type: Number, 
        required: true 
    },
    category: { 
        type: String,
        required: true,
        trim: true,
        enum: ['Food & Beverages', 'Groceries', 'Travel', 'Clothes & Accessories', 'Education', 'Bills & Utilities', 'Entertainment', 'Health', 'Other']
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    source: { 
        type: String, 
        enum: ['manual', 'receipt', 'upi_csv'], 
        default: 'manual' 
    }
});

module.exports = mongoose.model('Expense', expenseSchema);