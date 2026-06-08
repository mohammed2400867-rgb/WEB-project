const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const { broadcast } = require('../sse');

const POINTS_PER_DOLLAR = 1;   // 1 point per EGP spent
const POINTS_TO_REDEEM = 200;  // need 200 points to redeem
const REDEEM_VALUE = 50;       // get EGP 50 off

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const { ids } = req.query;
        if (!ids) return res.json([]);
        const idArray = ids.split(',').map(id => id.trim()).filter(Boolean);
        const orders = await Order.find({ orderId: { $in: idArray } }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.id });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createOrder = async (req, res) => {
    try {
        const { items, total, payment, address, phone, userId, pointsToRedeem } = req.body;

        // --- Items required ---
        if (!items || !items.length)
            return res.status(400).json({ message: 'No items in order.' });

        // --- Address: required and must contain at least one letter (not numbers-only) ---
        if (!address || !address.trim())
            return res.status(400).json({ message: 'Delivery address is required.' });
        if (!/[a-zA-Z]/.test(address.trim()))
            return res.status(400).json({ message: 'Please enter a valid delivery address (must include a street name, not just numbers).' });

        // Sanitize userId to prevent Mongoose CastErrors
        const sanitizedUserId = (userId && mongoose.Types.ObjectId.isValid(userId)) ? userId : null;

        let discount = 0;
        let actualPointsRedeemed = 0;

        if (sanitizedUserId && pointsToRedeem > 0) {
            const user = await User.findById(sanitizedUserId);
            if (user && user.loyaltyPoints >= pointsToRedeem) {
                const redeemUnits = Math.floor(pointsToRedeem / POINTS_TO_REDEEM);
                actualPointsRedeemed = redeemUnits * POINTS_TO_REDEEM;
                discount = redeemUnits * REDEEM_VALUE;
                user.loyaltyPoints -= actualPointsRedeemed;
                await user.save();
                await LoyaltyTransaction.create({
                    userId: sanitizedUserId, points: -actualPointsRedeemed, type: 'redeemed',
                    description: `Redeemed ${actualPointsRedeemed} pts for EGP ${discount} off`
                });
            }
        }

        const finalTotal = Math.max(0, (Number(total) || 0) - discount);
        const pointsEarned = Math.floor(finalTotal * POINTS_PER_DOLLAR);
        const orderId = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);

        const order = await Order.create({
            orderId, items, total: finalTotal, discount, pointsEarned,
            pointsRedeemed: actualPointsRedeemed, payment, address, phone,
            userId: sanitizedUserId
        });

        if (sanitizedUserId && pointsEarned > 0) {
            await User.findByIdAndUpdate(sanitizedUserId, { $inc: { loyaltyPoints: pointsEarned } });
            await LoyaltyTransaction.create({
                userId: sanitizedUserId, points: pointsEarned, type: 'earned',
                description: `Earned ${pointsEarned} pts on order ${orderId}`,
                orderId
            });
        }

        broadcast({
            type: 'new_order',
            orderId: order.orderId,
            itemCount: order.items.length,
            total: order.total,
            payment: order.payment
        });

        res.status(201).json({ ...order.toObject(), pointsEarned, discount, newLoyaltyBalance: sanitizedUserId ? (await User.findById(sanitizedUserId).select('loyaltyPoints')).loyaltyPoints : null });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) return res.status(400).json({ message: 'Status is required' });
        const order = await Order.findOneAndUpdate({ orderId: req.params.id }, { status }, { new: true, runValidators: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        broadcast({ type: 'status_update', orderId: order.orderId, status: order.status });

        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getOrders, getMyOrders, getOrderById, createOrder, updateOrderStatus, getUserOrders };
