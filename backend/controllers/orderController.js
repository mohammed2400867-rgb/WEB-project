const Order = require('../models/Order');

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
        const { items, total, payment, address, phone, userId } = req.body;
        if (!items || !items.length) return res.status(400).json({ message: 'No items in order' });
        const orderId = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);
        const order = await Order.create({ orderId, items, total: Number(total), payment, address, phone, userId: userId || null });
        res.status(201).json(order);
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
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getOrders, getMyOrders, getOrderById, createOrder, updateOrderStatus };
