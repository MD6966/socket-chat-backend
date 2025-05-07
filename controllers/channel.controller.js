const { Channel } = require("../models/channel.model");

const channelController = {
  createChannel: async (req, res, next) => {
    try {
      const { name } = req.body;
      const channelId = await Channel.create(name);
      res
        .status(201)
        .json({ id: channelId, message: "Channel created successfully" });
    } catch (error) {
      next(error);
    }
  },

  getChannel: async (req, res, next) => {
    try {
      const channelId = req.params.channelId;
      const channel = await Channel.findById(channelId);
      if (!channel) {
        return res.status(404).json({ message: "Channel not found" });
      }
      res.json(channel);
    } catch (error) {
      next(error);
    }
  },

  getAllChannels: async (req, res, next) => {
    try {
      const channels = await Channel.findAll();
      res.json(channels);
    } catch (error) {
      next(error);
    }
  },

  addUser: async (req, res, next) => {
    try {
      const channelId = req.params.channelId;
      const userId = req.body.userId;
      await Channel.addUserToChannel(channelId, userId);
      res.json({ message: "User added to channel successfully" });
    } catch (error) {
      next(error);
    }
  },

  removeUser: async (req, res, next) => {
    try {
      const channelId = req.params.channelId;
      const userId = req.params.userId;
      await Channel.removeUserFromChannel(channelId, userId);
      res.json({ message: "User removed from channel successfully" });
    } catch (error) {
      next(error);
    }
  },

  getUsersInChannel: async (req, res, next) => {
    try {
      const channelId = req.params.channelId;
      const users = await Channel.findUsersInChannel(channelId);
      res.json(users);
    } catch (error) {
      next(error);
    }
  },

  getUserChannels: async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const channels = await Channel.findUserChannels(userId);
      res.json(channels);
    } catch (error) {
      next(error);
    }
  },
};
module.exports = channelController;
