const Staff = require('../models/Staff');
const User = require('../models/User');

const getStaff = async (req, res) => {
    try {
        const staff = await Staff.find().sort({ createdAt: 1 });
        res.json(staff);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addStaff = async (req, res) => {
    try {
        const { name, email, role } = req.body;
        if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });

        const exists = await Staff.findOne({ email: email.toLowerCase() });
        if (exists) return res.status(400).json({ message: 'Staff member with this email already exists' });

        const staff = await Staff.create({ name, email, role: role || 'Staff' });

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (!userExists) {
            await User.create({ email, password: 'Welcome123!', role: role || 'Staff' });
        } else {
            userExists.role = role || 'Staff';
            await userExists.save();
        }

        res.status(201).json({ staff, message: 'Staff added. Default password: Welcome123!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const removeStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff member not found' });
        res.json({ message: 'Staff member removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getStaff, addStaff, removeStaff };
