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

        // --- Required fields ---
        if (!name || !phone || !date || !guests)
            return res.status(400).json({ message: 'Name, phone, date, and guests are required.' });

        // --- Date must not be in the past ---
        const selectedDate = new Date(date);
        if (isNaN(selectedDate.getTime()))
            return res.status(400).json({ message: 'Invalid date format.' });

        if (selectedDate <= new Date())
            return res.status(400).json({ message: 'Reservation date must be in the future.' });

        // --- Operating hours check ---
        // Mon(1)–Thu(4): 17:00–22:00  |  Fri(5), Sat(6), Sun(0): 16:00–23:30
        const day = selectedDate.getDay();
        const timeInMinutes = selectedDate.getHours() * 60 + selectedDate.getMinutes();
        const isWeekend = day === 0 || day >= 5;

        const openTime  = isWeekend ? 16 * 60       : 17 * 60;      // 4 PM or 5 PM
        const closeTime = isWeekend ? 23 * 60 + 30  : 22 * 60;      // 11:30 PM or 10 PM
        const hoursLabel = isWeekend ? '4:00 PM – 11:30 PM' : '5:00 PM – 10:00 PM';

        if (timeInMinutes < openTime || timeInMinutes >= closeTime)
            return res.status(400).json({
                message: `We are not open at that time. Our hours are ${hoursLabel} on that day.`
            });

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
