const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');
const Transaction = require('../models/Transaction');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/dashboard', adminCtrl.getDashboard);
router.get('/leads', adminCtrl.getAllLeads);
router.patch('/leads/:id/verify', adminCtrl.verifyLead);
router.patch('/leads/:id/reject', adminCtrl.rejectLead);
router.get('/users', adminCtrl.getUsers);
router.patch('/users/:id/toggle-active', adminCtrl.toggleUserActive);

// ADMIN TRANSACTIONS
router.get('/transactions', async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('userId', 'name email role')
            .populate('leadId', 'service location budget');

        res.json({ transactions });
    } catch (err) {
        console.error('Admin transactions error:', err);
        res.status(500).json({ error: 'Failed to fetch admin transactions.' });
    }
});

module.exports = router;