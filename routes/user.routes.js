const express = require("express");
const {
  userRegistration,
  userLogin,
  userDeletion,
  userModification,
  usersList,
  userById,
  userByUniqueKey,
} = require("../controllers/user.controller");

// router
const userRouter = express.Router();

userRouter.post("/login", userLogin);
userRouter.post("/register", userRegistration);
userRouter.get("/users", usersList);
userRouter.get("/user/:id", userById);
userRouter.put("/user/:id", userModification);
userRouter.delete("/user/:id", userDeletion);
userRouter.post("/find-key", userByUniqueKey);
module.exports = userRouter;
