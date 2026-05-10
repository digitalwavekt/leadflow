const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");
const createNotification = require("../utils/createNotification");

// GET /api/notifications
router.get("/", protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const notifications = await Notification.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({
            user: userId,
            isRead: false,
        });

        res.json({
            success: true,
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch notifications",
        });
    }
});

// PUT /api/notifications/read-all
router.put("/read-all", protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        await Notification.updateMany(
            { user: userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error) {
        console.error("Mark all read error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark all notifications as read",
        });
    }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: userId,
            },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("Mark notification read error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark notification as read",
        });
    }
});

// DELETE /api/notifications/:id
router.delete("/:id", protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: userId,
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found",
            });
        }

        res.json({
            success: true,
            message: "Notification deleted",
        });
    } catch (error) {
        console.error("Delete notification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete notification",
        });
    }
});

// Optional test route
// POST /api/notifications/test
router.post("/test", protect, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        const notification = await createNotification({
            userId,
            title: "Test Notification",
            message: "Realtime notification system is working.",
            type: "system",
            link: "/notifications",
        });

        res.json({
            success: true,
            notification,
        });
    } catch (error) {
        console.error("Test notification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create test notification",
        });
    }
});

module.exports = router;