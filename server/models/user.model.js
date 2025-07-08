const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    googleId: {
        type: String
    },
    theme: { 
        type: String, 
        enum: ['light', 'dark'], default: 'light' 
    }
}, {timestamps: true});

//hash password before saving
userSchema.pre('save', async function (name) {
    if(!this.isModified('password')) return;
    this.password = await(bcrypt.hash(this.password, 10));
});

module.exports  = mongoose.model('User', userSchema);