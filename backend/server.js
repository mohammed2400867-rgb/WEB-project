require('dotenv').config();
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./seed');
const { addClient } = require('./sse');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const staffRoutes = require('./routes/staffRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

app.use(express.json());

app.get('/api/events', (req, res) => {
    addClient(res);
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/messages', messageRoutes);

app.use(express.static(path.join(__dirname, '../Front')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front', 'index.html'));
});

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
    await seedDatabase();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Flour & Flame server running on port ${PORT}`);
    });
});
