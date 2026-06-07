const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/Staff');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) return res.status(400).json({ message: 'Email is already registered' });

        let role = 'Customer';
        const staffRecord = await Staff.findOne({ email: email.toLowerCase() });
        if (staffRecord) {
            role = staffRecord.role;
        } else if (email.toLowerCase().endsWith('@flourandflame.com')) {
            const prefix = email.toLowerCase().split('@')[0];
            if (prefix === 'admin') {
                role = 'Admin';
            } else if (prefix === 'staff') {
                role = 'Staff';
            } else if (prefix === 'kitchen') {
                role = 'Kitchen';
            }
        }

        const user = await User.create({ email, password, role });
        res.status(201).json({ _id: user._id, email: user.email, role: user.role, token: generateToken(user._id) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const staffRecord = await Staff.findOne({ email: email.toLowerCase() });
        if (staffRecord && staffRecord.role !== user.role) {
            user.role = staffRecord.role;
            await user.save();
        }

        res.json({ _id: user._id, email: user.email, role: user.role, token: generateToken(user._id) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMe = async (req, res) => {
    res.json({ _id: req.user._id, email: req.user.email, role: req.user.role });
};

module.exports = { register, login, getMe };
