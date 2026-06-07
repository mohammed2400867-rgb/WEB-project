const express = require('express');
const router = express.Router();
const { getStaff, addStaff, removeStaff } = require('../controllers/staffController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('Admin'), getStaff);
router.post('/', protect, requireRole('Admin'), addStaff);
router.delete('/:id', protect, requireRole('Admin'), removeStaff);

module.exports = router;
