const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req,res) => {
    try{
        const {name,email,password} = req.body;
        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const existingUser = await User.findOne({email});
        if (existingUser){
            return res.status(400).json({message: "User alraeady exists"});
        }
        const user = new User({
            name,
            email,
            password
        });
        const token = createToken(user._id);
        await user.save();
        return res.status(201).json(
            {message: "Registration successful"},
            {
                user: 
                {
                    id: user._id,
                    name: user.name,
                    email: user.email
                },

            }
        );
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    }
};

exports.login = async(req,res) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const token = createToken(user._id);
        return res.status(200).json({message: "Login successful",user,token });
    }
    catch (error){
        console.error(error);
        return res.status(500).json({message: "Internal server error"});
    } 
};

exports.googleAuth = (req, res) => {
    const user = req.user;
    const token = createToken(user._id);
    return res.status(200).json({
        message: "Google login successful",
        user: {
            id: user._id,
            name: user.name,
            email: user.email
        },
        token
    });
};
