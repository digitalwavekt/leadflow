const PlatformSettings = require('../models/PlatformSettings');

const getSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();

        if (!settings) {
            settings = await PlatformSettings.create({});
        }

        res.json({
            success: true,
            settings,
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings',
        });
    }
};

const updateSettings = async (req, res) => {
    try {
        const {
            commissionPercent,
            baseLeadPrice,
            highQualityLeadPrice,
            paymentMode,
            maintenanceMode,
        } = req.body;

        let settings = await PlatformSettings.findOne();

        if (!settings) {
            settings = await PlatformSettings.create({});
        }

        if (commissionPercent !== undefined) {
            settings.commissionPercent = Number(commissionPercent);
        }

        if (baseLeadPrice !== undefined) {
            settings.baseLeadPrice = Number(baseLeadPrice);
        }

        if (highQualityLeadPrice !== undefined) {
            settings.highQualityLeadPrice = Number(highQualityLeadPrice);
        }

        if (paymentMode !== undefined) {
            settings.paymentMode = paymentMode;
        }

        if (maintenanceMode !== undefined) {
            settings.maintenanceMode = Boolean(maintenanceMode);
        }

        await settings.save();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings,
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings',
        });
    }
};

module.exports = {
    getSettings,
    updateSettings,
};