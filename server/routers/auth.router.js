// Modules
const express = require("express");
const passport = require("passport");

// Controllers
const { register, login, logout, getMe, googleCallback } = require("../controllers/auth.controller");

// Middlewares
const { protect } = require("../middlewares/auth.middleware");

// -------------------------------------IMPORTS-------------------------------------

const authRouter = express.Router();

// Route to register new user (/api/v1/auth/register)
authRouter.post("/register", register);
// Route to login user (/api/v1/auth/login)
authRouter.post("/login", login);
// Route to logout user (/api/v1/auth/logout)
authRouter.delete("/logout", logout);
// Route to auto login (/api/v1/auth/me)
authRouter.get("/me", protect, getMe);

// Route to google authenticate (redirect to google page)
authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
// Route to google authenticate (send token and redirect to platform)
authRouter.get("/google/callback", passport.authenticate("google", { session: false }), googleCallback);

module.exports = authRouter;