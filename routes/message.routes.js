const express = require("express");
const router = express.Router();
const messageController = require("../controllers/message.controller");
const upload = require("../middlewares/upload");

router.post("/send", messageController.sendMessage);

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { channelId, senderId, content, fileType } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const { Message } = require("../models/message.model");
    const id = await Message.create({
      channelId,
      senderId,
      content,
      fileUrl,
      fileType,
    });

    res.status(201).json({ id, message: "File message sent" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:channelId", messageController.getChannelMessages);

module.exports = router;
