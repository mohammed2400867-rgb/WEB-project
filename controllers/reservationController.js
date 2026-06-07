const Reservation = require('../models/Reservation');

const getReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ createdAt: -1 });
        res.json(reservations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createReservation = async (req, res) => {
    try {
        const { name, phone, date, guests, requests } = req.body;
        if (!name || !phone || !date || !guests) return res.status(400).json({ message: 'Name, phone, date, and guests are required' });
        const reservationId = 'RES-' + Math.floor(Math.random() * 90000 + 10000);
        const reservation = await Reservation.create({ reservationId, name, phone, date, guests, requests: requests || '' });
        res.status(201).json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateReservation = async (req, res) => {
    try {
        const { status, date } = req.body;
        const update = {};
        if (status) update.status = status;
        if (date) update.date = date;
        const reservation = await Reservation.findOneAndUpdate({ reservationId: req.params.id }, update, { new: true, runValidators: true });
        if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
        res.json(reservation);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getReservations, createReservation, updateReservation };
