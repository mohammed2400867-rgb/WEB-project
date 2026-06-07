require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
const loyaltyRoutes = require('./routes/loyaltyRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Handle malformed JSON bodies
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'Invalid JSON in request body' });
    }
    next(err);
});

// SSE — real-time notifications
app.get('/api/events', (req, res) => {
    addClient(res);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/loyalty', loyaltyRoutes);

// 404 handler for unknown /api/* routes (must be before static files)
app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Serve static frontend
app.use(express.static(path.join(__dirname, '../Front')));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front', 'index.html'));
});

// Global error handler — catches any unhandled errors passed via next(err)
app.use((err, req, res, next) => {
    console.error('[Server Error]', err.stack || err.message);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(async () => {
        await seedDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Flour & Flame server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('[Startup Error] Failed to start server:', err.message);
        process.exit(1);
    });
