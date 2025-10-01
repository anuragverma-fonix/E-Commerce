const express = require('express');
const cp = require("cookie-parser");
const dbconnect = require('./config/dbconnect');
const cors = require('cors');
const helmet = require("helmet");
const limit = require("express-rate-limit");
// const fileUpload = require("express-fileupload");
const http = require('http');
const { Server } = require("socket.io");
const Chat = require("./models/chat");
const Message = require('./models/message');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

require("dotenv").config();

const app = express();

const port = process.env.PORT || 5001;

dbconnect();

const routes = require('./routes/routes');

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cp());

app.use(cors({
    origin: "*",
    // credentials: true,
}));

app.use(helmet());

// app.use(
// 	fileUpload({
// 		useTempFiles: true,
// 		tempFileDir: "/tmp/",
// 	})
// );

//Rate Limiting
const limiter = limit({
    windowMs: 15 * 60 * 60 * 1000,
    max: 100,
    message: "Limit Reached"
})

//Routes
// app.use(limiter);
app.use('/api/v1', routes);

//Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-Commerce API",
      version: "1.0.0",
      description: "API documentation for the E-Commerce platform",
    },
    servers: [
      {
        url: `http://localhost:${port}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/**/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));


//Socket Logic
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    // methods: ["GET", "POST"],
    // credentials: true,
  }
});

const activeUsers = new Map(); //onlineUsers
// const onlineAdmins = new Map();

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {

    activeUsers.set(userId, socket.id); // Which Socket belongs to which User
    console.log("Active Users:", activeUsers);

  });

  // socket.on("joinAdmin", (adminId) => {
  //   activeUsers.set(adminId, socket.id);
  //   console.log("Admin connected:", adminId);
  // });

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

      // 3. Emit to receiver if online(map)
      const receiverSocketId = activeUsers.get(receiverId.toString());
      // const receiverSocketId = isAdmin ? onlineAdmins.get(receiverId.toString()) : activeUsers.get(receiverId.toString());

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

    activeUsers.forEach((value, key) => { //value = socket.id key=userId
      if (value === socket.id) activeUsers.delete(key);
    });

    // onlineAdmins.forEach((value, key) => {
    //   if (value === socket.id) onlineAdmins.delete(key);
    // });

    console.log("User disconnected:", socket.id);

  });

});

// Make io accessible in controllers
app.set("io", io);
app.set("onlineUsers", activeUsers);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

server.listen(port, () => console.log(`Server running on port ${port}`));