const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Users",
        required: true,
    },
    type: {
        type: String,
        enum: ["OrderPlaced", "OrderShipped", "ChatMessage", "PaymentSuccess", "NewRegistration"],
        required: true,
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
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: {
        createdAt:"created_at",
        updatedAt:"updated_at"
    }
});

const Notification = mongoose.model("tbl_Notifications", notificationSchema);
module.exports = Notification;