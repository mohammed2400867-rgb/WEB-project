const Message = require('../models/Message');

const getMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: 'Name, email, and message are required' });
        const msgId = 'MSG-' + Math.floor(Math.random() * 90000 + 10000);
        const msg = await Message.create({ msgId, name, email, subject: subject || '', message });
        res.status(201).json(msg);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getMessages, addMessage };
