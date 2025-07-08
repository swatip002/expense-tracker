const Budget = require('../models/budget.model');

exports.setBudget = async (req, res) => {
    try {
        const { category, amount, period } = req.body;
        if(amount == null || isNaN(amount) || amount <= 0){
            return res.status(400).json({ message: 'Invalid amount'});
        } 

        if (!period || typeof period !== "string") {
        return res.status(400).json({ error: "Period is required " });
        }

        const query = { user: req.user.id, period};
        if(category !== undefined && category !== null){
            query.category = category;
        }

        const budget = await Budget.findOneAndUpdate(
            query,
            { amount },
            { new: true, upsert: true } // create if doesnt exist
        );
        res.status(200).json(budget);
    }
    catch (error){
        console.error('Error setting budget:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
};

exports.getBudget = async (req, res) => {
    try {
        const {category, period}  = req.body;
        const query = { user: req.user.id};
        if(category !== undefined && category !== null){
            query.category = category;
        }
        if(period !== undefined && period !== null){
            query.period = period;
        }
        const budget = await Budget.find(query);
        res.status(200).json(budget);
    }
    catch (error){
        console.error('Error getting budget:', error);
        res.status(500).json({ message: 'Internal server error'});
    }
}