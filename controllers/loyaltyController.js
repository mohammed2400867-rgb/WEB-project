const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

const POINTS_PER_DOLLAR = 1;
const POINTS_TO_REDEEM = 100;
const REDEEM_VALUE = 5;

const getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('loyaltyPoints email');
        res.json({ points: user.loyaltyPoints, redeemableDiscounts: Math.floor(user.loyaltyPoints / POINTS_TO_REDEEM), redeemValue: REDEEM_VALUE, pointsRequired: POINTS_TO_REDEEM });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const transactions = await LoyaltyTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const redeemPoints = async (req, res) => {
    try {
        const { units } = req.body;
        const redeemUnits = Math.max(1, parseInt(units) || 1);
        const pointsNeeded = redeemUnits * POINTS_TO_REDEEM;
        const discount = redeemUnits * REDEEM_VALUE;

        const user = await User.findById(req.user._id);
        if (user.loyaltyPoints < pointsNeeded) {
            return res.status(400).json({ message: `Not enough points. You need ${pointsNeeded} but have ${user.loyaltyPoints}.` });
        }

        res.json({ discount, pointsToSpend: pointsNeeded, newBalance: user.loyaltyPoints - pointsNeeded });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getBalance, getHistory, redeemPoints, POINTS_PER_DOLLAR, POINTS_TO_REDEEM, REDEEM_VALUE };
