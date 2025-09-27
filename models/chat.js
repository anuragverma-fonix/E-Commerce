const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Order",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Users",
        required: true,
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Users",
        required: true,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Messages",
    }],
    status: {
        type: String,
        enum: ["open", "close"],
        default: "open",
    },
}, {
    timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    }
});

const Chat = mongoose.model("tbl_Chats", chatSchema);
module.exports = Chat;