const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    msgId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, default: '' },
    message: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
