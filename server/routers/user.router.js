// Modules
const express = require("express");

// Controllers
const { getUsers, deleteUser } = require("../controllers/user.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");
const checkBan = require("../middlewares/checkBan.middleware");

// -------------------------------------IMPORTS-------------------------------------

const userRouter = express.Router();

userRouter.use(protect, checkBan)

// Route to get all users
userRouter.get("/", allowedTo("admin"), getUsers);

// Route to delete user account
userRouter.delete("/:id", deleteUser);

module.exports = userRouter;