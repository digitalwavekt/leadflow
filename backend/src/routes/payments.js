const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { createOrder, verifyPayment, refundLead, getCreditPacks } = require('../controllers/paymentController');

const router = express.Router();
router.get('/packs', getCreditPacks);
router.post('/create-order', protect, restrictTo('designer'), createOrder);
router.post('/verify', protect, restrictTo('designer'), verifyPayment);
router.post('/refund', protect, restrictTo('admin'), refundLead);
module.exports = router;
