const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { emitUserNotification } = require('../config/socket');
const createNotification = require('../utils/createNotification');

const CREDIT_PACKS = {
  starter: { credits: 50, bonusCredits: 0, priceINR: 999 },
  pro: { credits: 150, bonusCredits: 10, priceINR: 2499 },
  enterprise: { credits: 500, bonusCredits: 50, priceINR: 6999 },
};

const createOrder = async (req, res) => {
  try {
    const { pack } = req.body;
    const packConfig = CREDIT_PACKS[pack];

    if (!packConfig) {
      return res.status(400).json({
        error: `Invalid pack. Choose from: ${Object.keys(CREDIT_PACKS).join(', ')}`,
      });
    }

    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: packConfig.priceINR * 100,
      currency: 'INR',
      pack,
      credits: packConfig.credits + packConfig.bonusCredits,
      priceINR: packConfig.priceINR,
    };

    res.json({ order: mockOrder });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, pack, mockSuccess = true } = req.body;

    const packConfig = CREDIT_PACKS[pack];

    if (!packConfig) {
      return res.status(400).json({ error: 'Invalid pack.' });
    }

    if (!mockSuccess) {
      return res.status(402).json({ error: 'Payment failed (mock).' });
    }

    const totalCredits = packConfig.credits + packConfig.bonusCredits;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const creditsBefore = user.credits || 0;

    user.credits = creditsBefore + totalCredits;
    await user.save();

    const transaction = await Transaction.create({
      userId: user._id,
      type: 'credit_purchase',
      creditsDelta: totalCredits,
      amountINR: packConfig.priceINR,
      description: `${pack.charAt(0).toUpperCase() + pack.slice(1)} Pack — ${totalCredits} credits`,
      paymentGateway: 'razorpay',
      paymentId: paymentId || `pay_mock_${Date.now()}`,
      orderId: orderId || `order_mock_${Date.now()}`,
      creditsBefore,
      creditsAfter: user.credits,
      status: 'success',
    });

    emitUserNotification(user._id, 'credits:added', {
      credits: totalCredits,
      total: user.credits,
    });

    await createNotification({
      userId: user._id,
      title: 'Credits Added',
      message: `${totalCredits} credits added to your wallet successfully.`,
      type: 'payment',
      link: '/designer/transactions',
      metadata: {
        transactionId: transaction._id,
        pack,
        creditsAdded: totalCredits,
        totalCredits: user.credits,
        amountINR: packConfig.priceINR,
      },
    });

    res.json({
      message: `${totalCredits} credits added to your account!`,
      creditsAdded: totalCredits,
      totalCredits: user.credits,
    });
  } catch (err) {
    console.error('Verify payment error:', err);
    res.status(500).json({ error: 'Failed to verify payment.' });
  }
};

const refundLead = async (req, res) => {
  try {
    const { leadId, reason } = req.body;
    const Lead = require('../models/Lead');

    const lead = await Lead.findById(leadId);

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found.' });
    }

    if (lead.status !== 'sold') {
      return res.status(400).json({ error: 'Can only refund sold leads.' });
    }

    if (lead.isRefunded) {
      return res.status(409).json({ error: 'Lead already refunded.' });
    }

    const designer = await User.findById(lead.purchasedBy);

    if (!designer) {
      return res.status(404).json({ error: 'Purchaser not found.' });
    }

    const creditsBefore = designer.credits || 0;

    designer.credits = creditsBefore + lead.creditCost;
    await designer.save();

    lead.isRefunded = true;
    lead.refundReason = reason || 'Invalid lead';
    lead.refundedAt = new Date();
    await lead.save();

    const transaction = await Transaction.create({
      userId: designer._id,
      type: 'refund',
      creditsDelta: lead.creditCost,
      description: `Refund for lead #${lead._id} — ${lead.refundReason}`,
      leadId: lead._id,
      creditsBefore,
      creditsAfter: designer.credits,
      status: 'success',
    });

    emitUserNotification(designer._id, 'credits:refunded', {
      credits: lead.creditCost,
      leadId: lead._id,
      reason: lead.refundReason,
    });

    await createNotification({
      userId: designer._id,
      title: 'Credits Refunded',
      message: `${lead.creditCost} credits refunded for an invalid lead.`,
      type: 'credit',
      link: '/designer/transactions',
      metadata: {
        leadId: lead._id,
        transactionId: transaction._id,
        creditsRefunded: lead.creditCost,
        reason: lead.refundReason,
      },
    });

    res.json({
      message: `${lead.creditCost} credits refunded to designer.`,
      creditsRefunded: lead.creditCost,
    });
  } catch (err) {
    console.error('Refund error:', err);
    res.status(500).json({ error: 'Refund failed.' });
  }
};

const getCreditPacks = async (req, res) => {
  res.json({ packs: CREDIT_PACKS });
};

module.exports = {
  createOrder,
  verifyPayment,
  refundLead,
  getCreditPacks,
};