const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['credit_purchase', 'lead_purchase', 'refund', 'bonus'],
      required: true,
    },
    // Credit delta (positive = added, negative = spent)
    creditsDelta: {
      type: Number,
      required: true,
    },
    // INR amount (only for credit_purchase)
    amountINR: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'success',
    },

    // For lead_purchase transactions
    leadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },

    // For credit_purchase: payment gateway info
    paymentGateway: {
      type: String,
      enum: ['razorpay', 'mock'],
      default: 'mock',
    },
    paymentId: { type: String }, // Gateway transaction ID
    orderId: { type: String },   // Gateway order ID

    // Snapshot of user credits before/after
    creditsBefore: { type: Number },
    creditsAfter: { type: Number },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
