const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['pasta', 'pizza', 'drinks', 'dessert'], required: true },
    image: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
