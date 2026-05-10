const { validationResult } = require('express-validator');
const Lead = require('../models/Lead');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { analyzeLeadWithAI } = require('../services/aiService');
const {
  emitLeadLocked,
  emitLeadUnlocked,
  emitLeadSold,
  emitUserNotification,
} = require('../config/socket');
const { detectDuplicate } = require('../services/duplicateService');
const createNotification = require('../utils/createNotification');

const LOCK_DURATION_MS =
  (parseInt(process.env.LEAD_LOCK_DURATION_MINUTES) || 2) * 60 * 1000;

/**
 * POST /api/leads/create
 */
const createLead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      service,
      budget,
      location,
      description,
      videoUrl,
      preferredStyle,
    } = req.body;

    const budgetNum = parseInt(budget);

    const budgetDisplay =
      budgetNum >= 100000
        ? `₹${(budgetNum / 100000).toFixed(1)}L`
        : `₹${(budgetNum / 1000).toFixed(0)}K`;

    const isDuplicate = await detectDuplicate(req.user._id, service);
    const aiResult = await analyzeLeadWithAI(description);

    const lead = await Lead.create({
      clientId: req.user._id,
      clientName: req.user.name,
      clientPhone: req.user.phone,
      service,
      budget: budgetNum,
      budgetDisplay,
      location,
      description,
      videoUrl: videoUrl || null,
      preferredStyle,
      tags: aiResult.tags,
      intentScore: aiResult.intentScore,
      aiAnalyzed: true,
      isDuplicate,
      status: 'pending',
      creditCost: deriveCreditCost(budgetNum, aiResult.intentScore),
    });

    await createNotification({
      userId: req.user._id,
      title: 'Lead Submitted',
      message: 'Your lead has been submitted and is pending admin verification.',
      type: 'lead',
      link: '/client',
      metadata: {
        leadId: lead._id,
      },
    });

    res.status(201).json({
      message: 'Lead submitted successfully. Pending verification.',
      lead: {
        id: lead._id,
        service: lead.service,
        budget: lead.budgetDisplay,
        status: lead.status,
        tags: lead.tags,
        intentScore: lead.intentScore,
      },
    });
  } catch (err) {
    console.error('Create lead error:', err);
    res.status(500).json({ error: 'Failed to submit lead.' });
  }
};

/**
 * GET /api/leads
 */
const getLeads = async (req, res) => {
  try {
    const {
      service,
      minBudget,
      maxBudget,
      location,
      quality,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { status: { $in: ['open', 'locked'] } };

    if (service) filter.service = service;
    if (quality) filter.quality = quality;
    if (location) filter.location = new RegExp(location, 'i');

    if (minBudget || maxBudget) {
      filter.budget = {};
      if (minBudget) filter.budget.$gte = parseInt(minBudget);
      if (maxBudget) filter.budget.$lte = parseInt(maxBudget);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Lead.countDocuments(filter);

    const leads = await Lead.find(filter)
      .sort({ intentScore: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-clientPhone -clientId')
      .lean();

    const leadsWithTeaser = leads.map((lead) => ({
      ...lead,
      descriptionTeaser: lead.description
        ? lead.description.substring(0, 100) + '...'
        : '',
      description: undefined,
    }));

    res.json({
      leads: leadsWithTeaser,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error('Get leads error:', err);
    res.status(500).json({ error: 'Failed to fetch leads.' });
  }
};

/**
 * POST /api/leads/lock
 */
const lockLead = async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required.' });
    }

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    if (lead.status !== 'open') {
      return res.status(409).json({
        error: 'Lead is not available (already locked or sold).',
      });
    }

    const lockExpiry = new Date(Date.now() + LOCK_DURATION_MS);

    lead.status = 'locked';
    lead.lockedBy = req.user._id;
    lead.lockExpiry = lockExpiry;
    await lead.save();

    emitLeadLocked(leadId, lockExpiry);

    res.json({
      message: 'Lead locked for 2 minutes.',
      lockExpiry,
      leadId,
    });
  } catch (err) {
    console.error('Lock lead error:', err);
    res.status(500).json({ error: 'Failed to lock lead.' });
  }
};

/**
 * POST /api/leads/unlock
 */
const unlockLead = async (req, res) => {
  try {
    const { leadId } = req.body;

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    if (
      lead.lockedBy?.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ error: 'You did not lock this lead.' });
    }

    lead.status = 'open';
    lead.lockedBy = null;
    lead.lockExpiry = null;
    await lead.save();

    emitLeadUnlocked(leadId);

    res.json({
      message: 'Lead unlocked.',
      leadId,
    });
  } catch (err) {
    console.error('Unlock lead error:', err);
    res.status(500).json({ error: 'Failed to unlock lead.' });
  }
};

/**
 * POST /api/leads/purchase
 */
const purchaseLead = async (req, res) => {
  try {
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: 'leadId is required.' });
    }

    const lead = await Lead.findById(leadId).populate(
      'clientId',
      'name phone email'
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    if (
      lead.status !== 'locked' ||
      lead.lockedBy?.toString() !== req.user._id.toString()
    ) {
      return res.status(409).json({
        error: 'You must lock the lead first.',
      });
    }

    if (lead.lockExpiry < new Date()) {
      return res.status(409).json({
        error: 'Lock expired. Please lock again.',
      });
    }

    const designer = await User.findById(req.user._id);

    if (!designer) {
      return res.status(404).json({ error: 'Designer not found.' });
    }

    if (designer.credits < lead.creditCost) {
      return res.status(402).json({
        error: `Insufficient credits. You need ${lead.creditCost} credits.`,
        creditsNeeded: lead.creditCost,
        creditsAvailable: designer.credits,
      });
    }

    const creditsBefore = designer.credits;

    designer.credits -= lead.creditCost;
    designer.totalLeadsPurchased = (designer.totalLeadsPurchased || 0) + 1;
    designer.totalSpent = (designer.totalSpent || 0) + lead.creditCost;
    await designer.save();

    lead.status = 'sold';
    lead.purchasedBy = req.user._id;
    lead.purchasedAt = new Date();
    lead.lockedBy = null;
    lead.lockExpiry = null;
    await lead.save();

    await Transaction.create({
      userId: req.user._id,
      type: 'lead_purchase',
      creditsDelta: -lead.creditCost,
      description: `Purchased lead #${lead._id} — ${lead.service}`,
      leadId: lead._id,
      creditsBefore,
      creditsAfter: designer.credits,
    });

    emitLeadSold(leadId);

    emitUserNotification(req.user._id, 'lead:purchased', {
      leadId,
      creditsLeft: designer.credits,
    });

    await createNotification({
      userId: req.user._id,
      title: 'Lead Purchased',
      message: `You purchased a ${lead.service} lead successfully.`,
      type: 'purchase',
      link: '/designer/leads',
      metadata: {
        leadId: lead._id,
        creditsUsed: lead.creditCost,
        creditsLeft: designer.credits,
      },
    });

    res.json({
      message: 'Lead purchased successfully!',
      creditsRemaining: designer.credits,
      lead: {
        id: lead._id,
        service: lead.service,
        budget: lead.budgetDisplay,
        location: lead.location,
        description: lead.description,
        tags: lead.tags,
        intentScore: lead.intentScore,
        clientName: lead.clientId?.name || lead.clientName,
        clientPhone: lead.clientId?.phone || lead.clientPhone,
        clientEmail: lead.clientId?.email,
      },
    });
  } catch (err) {
    console.error('Purchase lead error:', err);
    res.status(500).json({ error: 'Failed to purchase lead.' });
  }
};

/**
 * GET /api/leads/:id
 */
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      'clientId',
      'name phone email'
    );

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    const isOwner = lead.purchasedBy?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.json({
        id: lead._id,
        service: lead.service,
        budgetDisplay: lead.budgetDisplay,
        location: lead.location,
        tags: lead.tags,
        intentScore: lead.intentScore,
        quality: lead.quality,
        status: lead.status,
        creditCost: lead.creditCost,
      });
    }

    res.json({ lead });
  } catch (err) {
    console.error('Get lead by id error:', err);
    res.status(500).json({ error: 'Failed to fetch lead.' });
  }
};

function deriveCreditCost(budget, intentScore) {
  if (budget >= 500000) return 7;
  if (budget >= 100000) return 5;
  if (budget >= 25000) return 3;
  return 2;
}

module.exports = {
  createLead,
  getLeads,
  lockLead,
  unlockLead,
  purchaseLead,
  getLeadById,
};