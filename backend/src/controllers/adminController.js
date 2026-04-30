const Lead = require('../models/Lead');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { emitNewLead } = require('../config/socket');

/**
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    const [
      totalLeads,
      pendingLeads,
      openLeads,
      soldLeads,
      totalDesigners,
      totalClients,
      recentLeads,
      recentTransactions,
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'pending' }),
      Lead.countDocuments({ status: 'open' }),
      Lead.countDocuments({ status: 'sold' }),
      User.countDocuments({ role: 'designer', isActive: true }),
      User.countDocuments({ role: 'client' }),
      Lead.find().sort({ createdAt: -1 }).limit(10).lean(),
      Transaction.find({ type: 'credit_purchase' })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .lean(),
    ]);

    // Revenue MTD
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const revenueAgg = await Transaction.aggregate([
      {
        $match: {
          type: 'credit_purchase',
          status: 'success',
          createdAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: '$amountINR' } } },
    ]);

    const revenueMTD = revenueAgg[0]?.total || 0;

    res.json({
      stats: { totalLeads, pendingLeads, openLeads, soldLeads, totalDesigners, totalClients, revenueMTD },
      recentLeads,
      recentTransactions,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard.' });
  }
};

/**
 * GET /api/admin/leads
 */
const getAllLeads = async (req, res) => {
  try {
    const { status, quality, service, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (quality) filter.quality = quality;
    if (service) filter.service = service;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('clientId', 'name phone')
      .populate('purchasedBy', 'name email')
      .lean();

    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
};

/**
 * PATCH /api/admin/leads/:id/verify
 * Approve lead → set status to open + quality
 */
const verifyLead = async (req, res) => {
  try {
    const { quality, adminNotes } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    if (lead.status !== 'pending') {
      return res.status(409).json({ error: 'Lead is not pending verification.' });
    }

    lead.status = 'open';
    lead.quality = quality || 'medium';
    lead.adminNotes = adminNotes;
    lead.verifiedBy = req.user._id;
    lead.verifiedAt = new Date();
    await lead.save();

    // Broadcast the new verified lead to designers in real-time
    emitNewLead(lead);

    res.json({ message: 'Lead verified and now live.', lead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify lead.' });
  }
};

/**
 * PATCH /api/admin/leads/:id/reject
 */
const rejectLead = async (req, res) => {
  try {
    const { reason } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        adminNotes: reason || 'Rejected by admin',
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
      },
      { new: true }
    );
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    res.json({ message: 'Lead rejected.', lead });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject lead.' });
  }
};

/**
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 25 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean();
    res.json({ users, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

/**
 * PATCH /api/admin/users/:id/toggle-active
 */
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle user.' });
  }
};

module.exports = { getDashboard, getAllLeads, verifyLead, rejectLead, getUsers, toggleUserActive };
