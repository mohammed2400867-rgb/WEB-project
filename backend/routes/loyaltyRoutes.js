const express = require('express');
const router = express.Router();
const { getBalance, getHistory, redeemPoints } = require('../controllers/loyaltyController');
const { protect } = require('../middleware/auth');

router.get('/balance', protect, getBalance);
router.get('/history', protect, getHistory);
router.post('/redeem', protect, redeemPoints);

module.exports = router;
