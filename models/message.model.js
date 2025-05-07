const { db } = require("../db");

const Message = {
  create: async ({ channelId, senderId, content, fileUrl, fileType }) => {
    const [result] = await db.promise().query(
      `INSERT INTO messages (channel_id, sender_id, content, file_url, file_type)
       VALUES (?, ?, ?, ?, ?)`,
      [channelId, senderId, content, fileUrl, fileType]
    );
    return result.insertId;
  },

  getByChannelId: async (channelId) => {
    const [rows] = await db.promise().query(
      `SELECT m.*, u.name AS sender_name FROM messages m
       JOIN users u ON u.id = m.sender_id
       WHERE m.channel_id = ? ORDER BY m.created_at ASC`,
      [channelId]
    );
    return rows;
  },
};

module.exports = { Message };
