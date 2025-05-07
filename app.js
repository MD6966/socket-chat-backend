const express = require("express");
const cors = require("cors");
const app = express();
app.use(
  cors({
    origin: "*", // Allow requests from your frontend (React app)
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

//routes imports
const userRouter = require("./routes/user.routes");
const channelRouter = require("./routes/channel.route");
const messageRouter = require("./routes/message.routes");
//routes declaration

app.use("/api/v1", userRouter);
app.use("/api/v1/channels", channelRouter);
app.use("/api/v1/message", messageRouter);

module.exports = app;
