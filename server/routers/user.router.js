// Modules
const express = require("express");

// Controllers
const { getUsers, deleteUser, editUserFullName, editUserEmailVerify, editUserEmailSetup } = require("../controllers/user.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");
const checkBan = require("../middlewares/checkBan.middleware");
const validate = require("../middlewares/validate.middleware");

// Validators
const { editUserFullNameSchema, editUserEmailSchema } = require("../validators/user.validator");

// -------------------------------------IMPORTS-------------------------------------

const userRouter = express.Router();

userRouter.use(protect, checkBan)

// Route to get all users
userRouter.get("/", allowedTo("admin"), getUsers);
// Route to change user fullname
userRouter.patch("/fullname/:id", validate(editUserFullNameSchema), editUserFullName);
// Route to send code in user email
userRouter.post("/email/setup/:id", editUserEmailSetup);
// Route to change user email
userRouter.patch("/email/verify", validate(editUserEmailSchema), editUserEmailVerify);
// Route to delete user account
userRouter.delete("/:id", deleteUser);

module.exports = userRouter;