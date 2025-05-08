const { db } = require("./db/index.js");
const app = require("./app.js");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const fs = require("fs");
const messageController = require("./controllers/message.controller");

// 1. Create HTTP server with Express app
const server = http.createServer(app);

// 2. Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // or specify frontend URL
    methods: ["GET", "POST"],
  },
});

// 3. Inject Socket.io instance into message controller
messageController.setSocketIO(io);

const connectedUsers = {}; // Track users by socket ID

// 4. Setup Socket.IO
io.on("connection", (socket) => {
  console.log(`✅ New client connected: ${socket.id}`);

  // Join a channel room
  socket.on("joinChannel", ({ channelId, userId }) => {
    socket.join(channelId);
    connectedUsers[socket.id] = { channelId, userId };
    console.log(`🟢 User ${userId} joined channel ${channelId}`);

    // Notify others in the channel about new user (optional)
    socket.to(channelId).emit("userJoined", { userId });
  });

  // Send text message
  socket.on("sendMessage", async ({ channelId, senderId, message }) => {
    try {
      // Save message to database
      const { Message } = require("./models/message.model");
      const messageId = await Message.create({
        channelId,
        senderId,
        content: message,
        fileUrl: null,
        fileType: null,
      });

      // Get user info for display
      const [userData] = await db
        .promise()
        .query(`SELECT name FROM users WHERE id = ?`, [senderId]);
      const senderName =
        userData.length > 0 ? userData[0].name : "Unknown User";

      // Send to all clients in the channel
      const data = {
        id: messageId,
        senderId,
        sender_name: senderName,
        message,
        type: "text",
        timestamp: new Date(),
        channelId,
      };

      io.to(channelId).emit("receiveMessage", data);
    } catch (error) {
      console.error("Error saving message:", error);
      socket.emit("error", { message: "Failed to save message" });
    }
  });

  // Send file
  socket.on(
    "sendFile",
    async ({ channelId, senderId, fileName, fileData, fileType }) => {
      try {
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, "uploads");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir);
        }

        const buffer = Buffer.from(fileData, "base64");
        const safeName = fileName.replace(/[^a-zA-Z0-9\-_.]/g, "_");
        const uniqueFileName = `${Date.now()}_${safeName}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        const fileUrl = `/uploads/${uniqueFileName}`;

        // Write file to disk
        fs.writeFile(filePath, buffer, async (err) => {
          if (err) {
            console.error("❌ File save error:", err);
            socket.emit("error", { message: "Failed to save file" });
            return;
          }

          try {
            // Save message to database
            const { Message } = require("./models/message.model");
            const messageId = await Message.create({
              channelId,
              senderId,
              content: `Sent a file: ${fileName}`,
              fileUrl,
              fileType,
            });

            // Get user info for display
            const [userData] = await db
              .promise()
              .query(`SELECT name FROM users WHERE id = ?`, [senderId]);
            const senderName =
              userData.length > 0 ? userData[0].name : "Unknown User";

            // Send to all clients in the channel
            const data = {
              id: messageId,
              senderId,
              sender_name: senderName,
              message: `Sent a file: ${fileName}`,
              fileUrl,
              fileName,
              fileType,
              channelId,
              type: "file",
              timestamp: new Date(),
            };

            io.to(channelId).emit("receiveMessage", data);
          } catch (error) {
            console.error("Error saving file message:", error);
            socket.emit("error", { message: "Failed to save file message" });
          }
        });
      } catch (error) {
        console.error("Error processing file:", error);
        socket.emit("error", { message: "Failed to process file" });
      }
    }
  );

  // Handle typing indicator (optional feature)
  socket.on("typing", ({ channelId, userId, isTyping }) => {
    socket.to(channelId).emit("userTyping", { userId, isTyping });
  });

  // On disconnect
  socket.on("disconnect", () => {
    const user = connectedUsers[socket.id];
    if (user) {
      console.log(
        `❌ User ${user.userId} disconnected from channel ${user.channelId}`
      );

      // Notify others in the channel about user leaving (optional)
      socket.to(user.channelId).emit("userLeft", { userId: user.userId });
    }

    console.log(`❌ Client disconnected: ${socket.id}`);
    delete connectedUsers[socket.id];
  });
});

// 5. Start the server
// db.connect((err) => {
//   if (err) {
//     console.error("❌ Error connecting to the database:", err);
//     process.exit(1);
//   } else {
//     console.log("✅ Connected to the database");

//   }
// });
app.use("/uploads", require("express").static("uploads"));

server.listen(process.env.PORT || 8000, () => {
  console.log(`⚙️ Server is running at port: ${process.env.PORT || 8000}`);
});
