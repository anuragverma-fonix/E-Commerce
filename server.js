const express = require('express');
const cp = require("cookie-parser");
const dbconnect = require('./config/dbconnect');
const cors = require('cors');
const helmet = require("helmet");
const limit = require("express-rate-limit");
const fileUpload = require("express-fileupload");
const http = require('http');
const { Server } = require("socket.io");
const Chat = require("./models/chat");

require("dotenv").config();

const app = express();

const port = process.env.PORT || 5001;

dbconnect();

const routes = require('./routes/routes');

//Middlewares
app.use(express.json());

app.use(cp());

app.use(cors({
    origin: "*",
    credentials: true,
}));

app.use(helmet());

app.use(express.urlencoded({extended:false}));

// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: "/tmp/",
// 	})
// );

//Rate Limiting
const limiter = limit({
    windowsMs: 15 * 60 * 60 * 1000,
    max: 100,
    message: "Limit Reached"
})

//Routes
app.use('/api/v1', routes);


//Socket Logics

// app.use("/api/notifications", notificationRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST", "PATCH", "DELETE"] }
});

const onlineUsers = new Map();

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {

    onlineUsers.set(userId, socket.id);
    console.log("Online Users:", onlineUsers);

  });


  socket.on("sendMessage", async ({ chatId, senderId, receiverId, content }) => {

    try {
      // 1. Save message in DB
      const message = await Message.create({
        chat: chatId,
        sender: senderId,
        content,
      });

      // 2. Add message to chat messages array
      const chat = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { messages: message._id } },
        { new: true }
      );

      // 3. Emit to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId.toString());

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", { chatId, message });
      }

      // Emit back to sender
      socket.emit("messageSent", { chatId, message });

    } catch (err) {
      console.error("Send Message Error:", err);
    }
  });


  socket.on("disconnect", () => {

    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });

    console.log("User disconnected:", socket.id);

  });

});

// Make io accessible in controllers
app.set("io", io);
app.set("onlineUsers", onlineUsers);


app.get('/', (req, res) => {
    res.send('Hello World!');
});

server.listen(port, () => console.log(`Server running on port ${port}`));