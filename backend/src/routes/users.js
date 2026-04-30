const express = require('express');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Lead = require('../models/Lead');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

router.get('/credits', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('credits name email');
    res.json({ credits: user.credits, user });
  } catch { res.status(500).json({ error: 'Failed to fetch credits.' }); }
});

router.get('/transactions', protect, async (req, res) => {
  try {
    const txns = await Transaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 }).limit(50).populate('leadId', 'service location');
    res.json({ transactions: txns });
  } catch { res.status(500).json({ error: 'Failed.' }); }
});

router.get('/purchased-leads', protect, restrictTo('designer'), async (req, res) => {
  try {
    const leads = await Lead.find({ purchasedBy: req.user._id }).sort({ purchasedAt: -1 });
    res.json({ leads });
  } catch { res.status(500).json({ error: 'Failed.' }); }
});

router.patch('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name', 'city', 'specializations', 'minBudget', 'preferredLocations', 'bio'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ message: 'Profile updated.', user });
  } catch { res.status(500).json({ error: 'Failed to update profile.' }); }
});

module.exports = router;
