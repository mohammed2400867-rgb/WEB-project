const express = require('express');
const router = express.Router();
const { getOrders, getMyOrders, getOrderById, createOrder, updateOrderStatus, getUserOrders } = require('../controllers/orderController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', protect, requireRole('Admin', 'Staff', 'Kitchen'), getOrders);
router.get('/my', getMyOrders);
router.get('/user', protect, getUserOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.put('/:id/status', protect, requireRole('Admin', 'Staff', 'Kitchen'), updateOrderStatus);

module.exports = router;
