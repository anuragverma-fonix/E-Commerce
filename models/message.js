const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    chat: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Chats",
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tbl_Users",
        required: true,
    },
    content: {
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
        createdAt: "createdAt",
        updatedAt: "updatedAt"
    }
});

const Message = mongoose.model("tbl_Messages", messageSchema);
module.exports = Message;