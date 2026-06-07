const express = require('express');
const router = express.Router();
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', getMenu);
router.post('/', protect, requireRole('Admin'), addMenuItem);
router.put('/:id', protect, requireRole('Admin'), updateMenuItem);
router.delete('/:id', protect, requireRole('Admin'), deleteMenuItem);

module.exports = router;
