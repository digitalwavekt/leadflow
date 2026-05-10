const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema(
    {
        commissionPercent: {
            type: Number,
            default: 10,
            min: 0,
            max: 100,
        },
        baseLeadPrice: {
            type: Number,
            default: 199,
            min: 0,
        },
        highQualityLeadPrice: {
            type: Number,
            default: 499,
            min: 0,
        },
        paymentMode: {
            type: String,
            enum: ['mock', 'razorpay'],
            default: 'mock',
        },
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);