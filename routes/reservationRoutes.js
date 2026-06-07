const express = require('express');
const router = express.Router();
const { getReservations, createReservation, updateReservation } = require('../controllers/reservationController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('Admin', 'Staff'), getReservations);
router.post('/', createReservation);
router.put('/:id', protect, requireRole('Admin', 'Staff'), updateReservation);

module.exports = router;
