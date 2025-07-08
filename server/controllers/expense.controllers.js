const Expense = require('../models/expense.model');

exports.getExpense = async (req, res) => {
    try{
        const expenses = await Expense.find({ user: req.user.id});
        return res.status(200).json(expenses);
    }
    catch(error){
        console.error(error);
        return res.json({message:"Internal server error"});
    }
};

exports.addExpense = async (req, res) => {
    try{
        const { amount, category, date} = req.body;
        if(!amount || !category || !date){
            return res.status(400).json({message: "All fields are required"});
        }
        const expense = new Expense({
            user: req.user.id,
            amount,
            category
        })
        await expense.save();
        return res.status(200).json({message: "Expense added successfully", expense});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

exports.updateExpense = async (req, res) => {
    try{
        const { id } = req.params;
        const { amount, category, date} = req.body;

        if(!amount || !category || !date){
            return res.status(400).json({message:"All fields are required"});
        }

        const expense = await Expense.findByIdAndUpdate(id, {
            amount,category,date
        },{new: true});
            
        if(!expense){
            return res.status(404).json({message: "Expense not found"});
        }
        return res.status(200).json({message:"updated successfully", expense})
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

exports.deleteExpense = async (req,res) => {
    try{
        const { id } = req.params;
        const expense = await Expense.findByIdAndDelete(id);
        if(!expense){
            return res.status(404).json({message: "Expense not found"});
        }
        return res.statuus(200).json({message:"deletion successful",expense});
    }
    catch(error){
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
};