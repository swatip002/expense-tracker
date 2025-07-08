const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    period: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    tips: {
        type: String
    }
},{ timestamps: true });

module.exports = mongoose.model('Report', reportSchema);