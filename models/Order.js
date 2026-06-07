const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    items: [{ name: String, price: Number, id: Number }],
    total: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 },
    status: { type: String, enum: ['Pending', 'Preparing', 'Ready', 'Delivered'], default: 'Pending' },
    payment: { type: String, default: 'cash' },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
