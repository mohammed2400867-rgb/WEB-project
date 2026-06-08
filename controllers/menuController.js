const MenuItem = require('../models/MenuItem');

const getMenu = async (req, res) => {
    try {
        const items = await MenuItem.find().sort({ createdAt: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addMenuItem = async (req, res) => {
    try {
        const { name, price, category, image } = req.body;
        if (!name || price === undefined || !category) return res.status(400).json({ message: 'Name, price, and category are required' });
        const item = await MenuItem.create({ name, price: Number(price), category, image: image || '' });
        res.status(201).json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateMenuItem = async (req, res) => {
    try {
        const { name, price, category, image } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (price !== undefined) update.price = Number(price);
        if (category !== undefined) update.category = category;
        if (image !== undefined) update.image = image;
        const item = await MenuItem.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteMenuItem = async (req, res) => {
    try {
        const item = await MenuItem.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: 'Menu item not found' });
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const uploadMenuImage = (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ path: '/uploads/' + req.file.filename });
};

module.exports = { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage };
