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

router.get('/analytics', protect, restrictTo('designer'), async (req, res) => {
  try {
    const leads = await Lead.find({ purchasedBy: req.user._id }).sort({ purchasedAt: -1 });
    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const totalLeads = leads.length;

    const totalSpend = transactions.reduce((sum, tx) => {
      return sum + (tx.amountINR || tx.amount || 0);
    }, 0);

    const revenuePotential = leads.reduce((sum, lead) => {
      return sum + (lead.budget || 0);
    }, 0);

    const categoryMap = {};

    leads.forEach((lead) => {
      const service = lead.service || 'Other';

      if (!categoryMap[service]) {
        categoryMap[service] = {
          name: service,
          leads: 0,
          converted: 0,
        };
      }

      categoryMap[service].leads += 1;

      if (lead.status === 'sold' || lead.status === 'open') {
        categoryMap[service].converted += 1;
      }
    });

    res.json({
      stats: {
        totalLeads,
        totalSpend,
        revenuePotential,
        costPerLead: totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0,
        conversionRate:
          totalLeads > 0
            ? Math.round((leads.filter((l) => l.status === 'sold' || l.status === 'open').length / totalLeads) * 100)
            : 0,
      },
      categoryData: Object.values(categoryMap),
      leads,
      transactions,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
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
