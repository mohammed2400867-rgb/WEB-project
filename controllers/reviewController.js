const Review = require('../models/Review');

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addReview = async (req, res) => {
    try {
        const { stars, quote, name, initials } = req.body;
        if (!stars || !quote || !name || !initials) return res.status(400).json({ message: 'All fields are required' });
        const review = await Review.create({ stars: Number(stars), quote, name, initials });
        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getReviews, addReview };
