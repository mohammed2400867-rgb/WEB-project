const express = require('express');
const router = express.Router();
const { getMenu, addMenuItem, updateMenuItem, deleteMenuItem, uploadMenuImage } = require('../controllers/menuController');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getMenu);
router.post('/upload', protect, requireRole('Admin'), upload.single('image'), uploadMenuImage);
router.post('/', protect, requireRole('Admin'), addMenuItem);
router.put('/:id', protect, requireRole('Admin'), updateMenuItem);
router.delete('/:id', protect, requireRole('Admin'), deleteMenuItem);

module.exports = router;
