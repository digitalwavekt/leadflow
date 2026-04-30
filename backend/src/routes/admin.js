const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const adminCtrl = require('../controllers/adminController');

const router = express.Router();
router.use(protect, restrictTo('admin'));
router.get('/dashboard', adminCtrl.getDashboard);
router.get('/leads', adminCtrl.getAllLeads);
router.patch('/leads/:id/verify', adminCtrl.verifyLead);
router.patch('/leads/:id/reject', adminCtrl.rejectLead);
router.get('/users', adminCtrl.getUsers);
router.patch('/users/:id/toggle-active', adminCtrl.toggleUserActive);
module.exports = router;
