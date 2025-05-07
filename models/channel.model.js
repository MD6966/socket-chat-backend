const { db } = require("../db");

const Channel = {
  create: async (name) => {
    try {
      const [result] = await db
        .promise()
        .query(
          "INSERT INTO channels (name, created_at) VALUES (?, NOW())",
          [name]
        );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const [rows] = await db
        .promise()
        .query("SELECT * FROM channels WHERE id = ?", [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  findAll: async () => {
    try {
      const [rows] = await db.promise().query("SELECT * FROM channels");
      return rows;
    } catch (error) {
      throw error;
    }
  },

  addUserToChannel: async (channelId, userId) => {
    try {
      const [result] = await db
        .promise()
        .query(
          "INSERT INTO channel_members (channel_id, user_id) VALUES (?, ?)",
          [channelId, userId]
        );
      return result;
    } catch (error) {
      throw error;
    }
  },

  removeUserFromChannel: async (channelId, userId) => {
    try {
      const [result] = await db
        .promise()
        .query(
          "DELETE FROM channel_members WHERE channel_id = ? AND user_id = ?",
          [channelId, userId]
        );
      return result;
    } catch (error) {
      throw error;
    }
  },

  findUsersInChannel: async (channelId) => {
    try {
      const [rows] = await db
        .promise()
        .query(
          "SELECT users.* FROM users JOIN channel_members ON users.id = channel_members.user_id WHERE channel_members.channel_id = ?",
          [channelId]
        );
      return rows;
    } catch (error) {
      throw error;
    }
  },

  findUserChannels: async (userId) => {
    try {
      const [rows] = await db
        .promise()
        .query(
          "SELECT channels.* FROM channels JOIN channel_members ON channels.id = channel_members.channel_id WHERE channel_members.user_id = ?",
          [userId]
        );
      return rows;
    } catch (error) {
      throw error;
    }
  },
};
module.exports = { Channel };
