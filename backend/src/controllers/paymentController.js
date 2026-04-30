const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { emitUserNotification } = require('../config/socket');

// Credit pack definitions
const CREDIT_PACKS = {
  starter: { credits: 50, bonusCredits: 0, priceINR: 999 },
  pro: { credits: 150, bonusCredits: 10, priceINR: 2499 },
  enterprise: { credits: 500, bonusCredits: 50, priceINR: 6999 },
};

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order (mock in development)
 */
const createOrder = async (req, res) => {
  try {
    const { pack } = req.body;
    const packConfig = CREDIT_PACKS[pack];

    if (!packConfig) {
      return res.status(400).json({
        error: `Invalid pack. Choose from: ${Object.keys(CREDIT_PACKS).join(', ')}`,
      });
    }

    // ── MOCK: In production, integrate Razorpay SDK ───────────────────────
    const mockOrder = {
      id: `order_mock_${Date.now()}`,
      amount: packConfig.priceINR * 100, // paise
      currency: 'INR',
      pack,
      credits: packConfig.credits + packConfig.bonusCredits,
      priceINR: packConfig.priceINR,
    };

    /* REAL RAZORPAY (uncomment in production):
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    const order = await razorpay.orders.create({
      amount: packConfig.priceINR * 100,
      currency: 'INR',
      receipt: `receipt_${req.user._id}_${Date.now()}`,
    });
    return res.json({ order, pack: packConfig });
    */

    res.json({ order: mockOrder });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

/**
 * POST /api/payments/verify
 * Verify payment and credit the designer's account
 */
const verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, pack, mockSuccess = true } = req.body;

    const packConfig = CREDIT_PACKS[pack];
    if (!packConfig) {
      return res.status(400).json({ error: 'Invalid pack.' });
    }

    /* REAL verification (uncomment in production):
    const crypto = require('crypto');
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');
    if (expectedSignature !== req.body.razorpaySignature) {
      return res.status(400).json({ error: 'Payment signature verification failed.' });
    }
    */

    // In mock/dev mode, always succeed unless told otherwise
    if (!mockSuccess) {
      return res.status(402).json({ error: 'Payment failed (mock).' });
    }

    const totalCredits = packConfig.credits + packConfig.bonusCredits;
    const user = await User.findById(req.user._id);
    const creditsBefore = user.credits;

    user.credits += totalCredits;
    await user.save();

    await Transaction.create({
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

    emitUserNotification(req.user._id, 'credits:added', {
      credits: totalCredits,
      total: user.credits,
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

/**
 * POST /api/payments/refund
 * Admin refunds credits for an invalid lead
 */
const refundLead = async (req, res) => {
  try {
    const { leadId, reason } = req.body;
    const Lead = require('../models/Lead');

    const lead = await Lead.findById(leadId);
    if (!lead) return res.status(404).json({ error: 'Lead not found.' });
    if (lead.status !== 'sold') return res.status(400).json({ error: 'Can only refund sold leads.' });
    if (lead.isRefunded) return res.status(409).json({ error: 'Lead already refunded.' });

    const designer = await User.findById(lead.purchasedBy);
    if (!designer) return res.status(404).json({ error: 'Purchaser not found.' });

    const creditsBefore = designer.credits;
    designer.credits += lead.creditCost;
    await designer.save();

    lead.isRefunded = true;
    lead.refundReason = reason || 'Invalid lead';
    lead.refundedAt = new Date();
    await lead.save();

    await Transaction.create({
      userId: designer._id,
      type: 'refund',
      creditsDelta: lead.creditCost,
      description: `Refund for lead #${lead._id} — ${lead.refundReason}`,
      leadId: lead._id,
      creditsBefore,
      creditsAfter: designer.credits,
    });

    emitUserNotification(designer._id, 'credits:refunded', {
      credits: lead.creditCost,
      leadId: lead._id,
      reason: lead.refundReason,
    });

    res.json({
      message: `${lead.creditCost} credits refunded to designer.`,
      creditsRefunded: lead.creditCost,
    });
  } catch (err) {
    res.status(500).json({ error: 'Refund failed.' });
  }
};

/**
 * GET /api/payments/packs
 * Return available credit packs
 */
const getCreditPacks = async (req, res) => {
  res.json({ packs: CREDIT_PACKS });
};

module.exports = { createOrder, verifyPayment, refundLead, getCreditPacks };
