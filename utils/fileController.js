const { File } = require("../models/file.model");
const { Message } = require("../models/message.model");
const path = require("path");
const fs = require("fs");

const fileController = {
  // Upload a file to a channel (could be image, document, or other file)
  uploadFile: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const { channelId } = req.params;
      const senderId = req.user.id; // Authenticated user
      
      // Get file information
      const { filename, originalname, mimetype, size } = req.file;
      
      // Determine file type
      let fileType = "file";
      if (mimetype.startsWith("image/")) {
        fileType = "image";
      } else if (
        mimetype === "application/pdf" || 
        mimetype.includes("document") ||
        mimetype.includes("spreadsheet") ||
        mimetype.includes("presentation")
      ) {
        fileType = "document";
      }
      
      // Save file details in database
      const fileId = await File.create({
        channelId,
        senderId,
        filename,
        originalname,
        mimetype,
        size,
        fileType,
        uploadedAt: new Date()
      });
      
      // Create a message to notify about the file
      const messageContent = {
        fileId,
        fileName: originalname,
        fileType,
        fileSize: size
      };
      
      // Create a message with the file reference
      await Message.create({
        channelId,
        senderId,
        content: JSON.stringify(messageContent),
        messageType: fileType, // "image", "document", or "file"
        createdAt: new Date()
      });
      
      res.status(201).json({
        id: fileId,
        filename: originalname,
        type: fileType,
        message: "File uploaded successfully"
      });
    } catch (error) {
      next(error);
    }
  },
  
  // Get file by ID
  getFile: async (req, res, next) => {
    try {
      const { fileId } = req.params;
      
      // Get file details from database
      const file = await File.findById(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Construct the file path
      const filePath = path.join(__dirname, "../uploads", file.filename);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on server" });
      }
      
      // Set appropriate content type
      res.setHeader("Content-Type", file.mimetype);
      res.setHeader("Content-Disposition", `inline; filename="${file.originalname}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  },
  
  // Delete a file
  deleteFile: async (req, res, next) => {
    try {
      const { fileId } = req.params;
      const userId = req.user.id; // Authenticated user
      
      // Get file details from database
      const file = await File.findById(fileId);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Check if user is authorized to delete the file
      if (file.senderId !== userId) {
        return res.status(403).json({ message: "Unauthorized to delete this file" });
      }
      
      // Delete the file from storage
      const filePath = path.join(__dirname, "../uploads", file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete file record from database
      await File.delete(fileId);
      
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = fileController;