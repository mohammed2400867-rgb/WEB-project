const express = require('express');
const router = express.Router();
const { getMessages, addMessage } = require('../controllers/messageController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('Admin'), getMessages);
router.post('/', addMessage);

module.exports = router;
