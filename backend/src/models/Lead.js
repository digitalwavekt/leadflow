const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    // ── Client Info ──────────────────────────────────────────────────────────
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },

    // ── Lead Details ─────────────────────────────────────────────────────────
    service: {
      type: String,
      required: true,
      enum: [
        'Interior Design',
        'Logo Design',
        'UI/UX Design',
        'Brand Identity',
        '3D Visualization',
        'Packaging Design',
        'Motion Design',
        'Graphic Design',
        'Other',
      ],
    },
    budget: {
      type: Number, // stored in INR (rupees)
      required: true,
      min: 0,
    },
    budgetDisplay: {
      type: String, // e.g. "₹2,00,000"
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    videoUrl: {
      type: String, // Cloudinary URL
    },
    preferredStyle: {
      type: String,
      enum: ['Modern', 'Natural', 'Luxury', 'Minimal', 'Rustic', 'Industrial', 'Other'],
    },

    // ── AI Analysis ──────────────────────────────────────────────────────────
    tags: [{ type: String }],
    intentScore: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    aiAnalyzed: {
      type: Boolean,
      default: false,
    },

    // ── Admin Fields ─────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ['pending', 'open', 'locked', 'sold', 'rejected', 'expired'],
      default: 'pending',
    },
    quality: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: null,
    },
    adminNotes: { type: String },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: { type: Date },
    isDuplicate: { type: Boolean, default: false },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
    },

    // ── Lock System ──────────────────────────────────────────────────────────
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    lockExpiry: {
      type: Date,
      default: null,
    },

    // ── Purchase ─────────────────────────────────────────────────────────────
    purchasedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    purchasedAt: { type: Date },
    creditCost: {
      type: Number,
      default: 5, // credits per lead
    },

    // ── Refund ───────────────────────────────────────────────────────────────
    isRefunded: { type: Boolean, default: false },
    refundReason: { type: String },
    refundedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ── Indexes for performance ───────────────────────────────────────────────────
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ service: 1, status: 1 });
leadSchema.index({ clientId: 1 });
leadSchema.index({ purchasedBy: 1 });
leadSchema.index({ lockExpiry: 1 });

// ── Virtual: is currently locked? ────────────────────────────────────────────
leadSchema.virtual('isLocked').get(function () {
  return this.status === 'locked' && this.lockExpiry && this.lockExpiry > new Date();
});

module.exports = mongoose.model('Lead', leadSchema);
