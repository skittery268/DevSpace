// Modules
const express = require("express");

// Controllers
const { getUsers, deleteUser } = require("../controllers/user.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");

// -------------------------------------IMPORTS-------------------------------------

const userRouter = express.Router();

// Route to get all users
userRouter.get("/", protect, allowedTo("admin"), getUsers);

// Route to delete user account
userRouter.delete("/:id", protect, deleteUser);

module.exports = userRouter;