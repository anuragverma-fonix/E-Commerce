const Notification = require("../models/notification");

const sendNotification = async ({ userId, type, title, message }, io, onlineUsers) => {

    try {
        // 1. Save to DB
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message
        });

        // 2. Emit real-time if user online
        const socketId = onlineUsers.get(userId.toString());
        
        if (socketId) {
            io.to(socketId).emit("notification", notification);
        }

        return notification;

    } catch (err) {
        console.error("Send Notification Error:", err);
    }
};

module.exports = sendNotification;