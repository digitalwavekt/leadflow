const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["lead", "payment", "credit", "purchase", "admin", "system", "profile"],
            default: "system",
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
        link: {
            type: String,
            default: "",
        },
        metadata: {
            type: Object,
            default: {},
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);