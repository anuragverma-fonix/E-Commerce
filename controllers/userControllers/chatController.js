const Chat = require('../../models/chat');

const createChat = async (req, res) => {

  try {

    const { orderId, senderId, receiverId } = req.body;
    console.log(req.body);

    // Check if a chat already exists
    let chat = await Chat.findOne({
      order: orderId,
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ]
    });

    if (!chat) {
      chat = await Chat.create({
        order: orderId,
        sender: senderId,
        receiver: receiverId,
        messages: [],
      });
    }

    res.json({ chatId: chat._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create chat' });
  }
};

module.exports = {
    createChat
}