const { Message } = require("../models/message.model");

// Socket.io instance will be injected from server.js
let io;

const messageController = {
  // Set Socket.io instance
  setSocketIO: (socketIO) => {
    io = socketIO;
  },

  sendMessage: async (req, res, next) => {
    try {
      console.log("Request body:", req.body);

      const {
        channelId,
        senderId,
        content,
        fileUrl = null,
        fileType = null,
      } = req.body;

      // Validate required fields
      if (!channelId || !senderId) {
        return res.status(400).json({
          error: "Missing required fields: channelId and senderId are required",
        });
      }

      // Create message in database
      const messageId = await Message.create({
        channelId,
        senderId,
        content: content || "",
        fileUrl,
        fileType,
      });

      // Get sender information to include in socket emission
      const [userData] = await db
        .promise()
        .query(`SELECT name FROM users WHERE id = ?`, [senderId]);

      const senderName =
        userData.length > 0 ? userData[0].name : "Unknown User";

      // Send message through socket to all users in the channel
      if (io) {
        io.to(channelId).emit("receiveMessage", {
          id: messageId,
          senderId,
          sender_name: senderName,
          message: content,
          fileUrl,
          fileType,
          channelId,
          timestamp: new Date(),
          type: fileUrl ? "file" : "text",
        });
      }

      res.status(201).json({
        id: messageId,
        message: "Message sent successfully",
        data: {
          channelId,
          senderId,
          content,
          fileUrl,
          fileType,
        },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: error.message });
    }
  },

  getChannelMessages: async (req, res, next) => {
    try {
      const channelId = req.params.channelId;

      if (!channelId) {
        return res.status(400).json({ error: "Missing channelId parameter" });
      }

      console.log("Getting messages for channel:", channelId);
      const messages = await Message.getByChannelId(channelId);

      res.status(200).json({
        count: messages.length,
        messages,
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = messageController;
