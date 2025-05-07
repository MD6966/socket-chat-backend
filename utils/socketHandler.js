const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const { Message } = require("../models/message.model");
const { User } = require("../models/user.model");

// Track online users
const onlineUsers = new Map();

function setupSocketIO(server) {
  const io = socketIO(server);
  
  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token missing"));
    }
    
    try {
      // Verify token (replace with your actual secret)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });
  
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`);
    
    // Add user to online users
    onlineUsers.set(socket.user.id, socket.id);
    
    // Join user to their channels
    socket.on("join-channel", (channelId) => {
      socket.join(`channel:${channelId}`);
      console.log(`User ${socket.user.id} joined channel ${channelId}`);
    });
    
    // Handle new message
    socket.on("send-message", async (data) => {
      try {
        const { channelId, content, messageType = "text" } = data;
        
        // Save message to database
        const messageId = await Message.create({
          channelId,
          senderId: socket.user.id,
          content,
          messageType,
          createdAt: new Date()
        });
        
        // Get sender information
        const sender = await User.findById(socket.user.id);
        
        // Broadcast to everyone in the channel
        io.to(`channel:${channelId}`).emit("new-message", {
          id: messageId,
          channelId,
          sender: {
            id: sender.id,
            name: sender.name,
            avatar: sender.avatar
          },
          content,
          messageType,
          createdAt: new Date()
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
    
    // Handle typing indicator
    socket.on("typing", ({ channelId, isTyping }) => {
      socket.to(`channel:${channelId}`).emit("user-typing", {
        userId: socket.user.id,
        isTyping
      });
    });
    
    // Handle read receipts
    socket.on("message-read", async ({ channelId, messageId }) => {
      try {
        // Update message read status in database
        await Message.markAsRead(messageId, socket.user.id);
        
        // Broadcast to the channel
        socket.to(`channel:${channelId}`).emit("message-read-receipt", {
          messageId,
          userId: socket.user.id,
          readAt: new Date()
        });
      } catch (error) {
        console.error("Error updating read receipt:", error);
      }
    });
    
    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.id}`);
      onlineUsers.delete(socket.user.id);
    });
  });
  
  return io;
}

module.exports = setupSocketIO;