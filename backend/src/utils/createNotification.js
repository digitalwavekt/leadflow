const Notification = require("../models/Notification");
const { emitNotification } = require("../config/socket");

const createNotification = async ({
    userId,
    title,
    message,
    type = "system",
    link = "",
    metadata = {},
}) => {
    const notification = await Notification.create({
        userId,
        title,
        message,
        type,
        link,
        metadata,
    });

    emitNotification(userId, notification);

    return notification;
};

module.exports = createNotification;