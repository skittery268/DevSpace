// Modules
const express = require("express");
const passport = require("passport");

// Controllers
const { register, login, logout, getMe, googleCallback, verifyEmail, forgotPassword, resetPassword, setup2FA, verify2FASetup, verify2FALogin, disable2FA } = require("../controllers/auth.controller");

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

// Route to verify user email
authRouter.get("/verify-email", verifyEmail);

// Route to send reset password code in user email
authRouter.post("/forgot-password", forgotPassword);
// Route to reset and change user password
authRouter.post("/reset-password", resetPassword);

// Route to start activate 2FA authentication in accoutn
authRouter.post("/2fa/setup", protect, setup2FA);
// Route to verify activate 2FA authentication in account
authRouter.post("/2fa/verify-setup", protect, verify2FASetup);
// Route to login with 2FA
authRouter.post("/2fa/verify-login", verify2FALogin);
// Route to disable 2FA authentication
authRouter.post("/2fa/disable", protect, disable2FA);

module.exports = authRouter;