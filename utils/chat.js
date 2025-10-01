const Chat = require("../models/chat");

const getOrCreateChat = async (userId, adminId) => {
    
  let chat = await Chat.findOne({
    $or: [
      { sender: userId, receiver: adminId },
      { sender: adminId, receiver: userId },
    ]
  }).populate("messages");

  if (!chat) {
    chat = await Chat.create({
      sender: userId,
      receiver: adminId,
      messages: [],
    });
  }

  return chat;
};

module.exports = {
  getOrCreateChat
}