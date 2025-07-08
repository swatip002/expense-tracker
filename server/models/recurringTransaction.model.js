const e = require('express');
const mongoose = require('mongoose');

const recurringSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
        enum: ['Food & Beverages', 'Groceries', 'Travel', 'Clothes & Accessories', 'Education', 'Bills & Utilities', 'Entertainment', 'Health', 'Other']
    },
    frequency: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextRun: {
        type: Date,
        required: true
    },
    lastRun: {
        type: Date
    },
    status: {
        type: String,
        required: true,
        enum: ['active', 'inactive'],
        default: 'active'
    }
});

module.exports = mongoose.model('RecurringTransaction', recurringSchema);