const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        type: String,
        trim:true,
        enum: ['Food & Beverages', 'Groceries', 'Travel', 'Clothes & Accessories', 'Education', 'Bills & Utilities', 'Entertainment', 'Health', 'Other']
    },
    amount: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        enum: ['monthly'],
        default: 'monthly',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);