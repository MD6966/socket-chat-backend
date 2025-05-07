const express = require("express");
const channelController = require("../controllers/channel.controller");
const channelRouter = express.Router();

channelRouter.post("/create", channelController.createChannel);
channelRouter.get("/channel/:channelId", channelController.getChannel);
channelRouter.get("/all", channelController.getAllChannels);
channelRouter.post("/:channelId/users", channelController.addUser);
channelRouter.delete("/:channelId/users/:userId", channelController.removeUser);
channelRouter.get("/:channelId/users", channelController.getUsersInChannel);
channelRouter.get("/users/:userId", channelController.getUserChannels);

module.exports = channelRouter;
