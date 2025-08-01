const jwt = require('jsonwebtoken');
const  User = require('../models/user.model');

module.exports = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token){
        if (!token) return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    }
    catch (error){
        console.error(error);
        res.status(401).json({ error: 'Invalid token' });
    }
}