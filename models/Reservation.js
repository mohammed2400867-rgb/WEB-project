const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    reservationId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: String, required: true },
    guests: { type: String, required: true },
    requests: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Declined'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
