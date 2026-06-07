const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    stars: { type: Number, required: true, min: 1, max: 5 },
    quote: { type: String, required: true },
    name: { type: String, required: true },
    initials: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
