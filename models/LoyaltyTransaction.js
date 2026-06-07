const mongoose = require('mongoose');

const loyaltyTransactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ['earned', 'redeemed'], required: true },
    description: { type: String, default: '' },
    orderId: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyTransaction', loyaltyTransactionSchema);
