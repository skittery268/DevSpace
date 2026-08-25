// Modules
const express = require("express");

// Controllers
const { getUserActiveWarnings, banUser, unBanUser, warnUser, unWarnUser } = require("../controllers/adminAction.controller");

// Middlewares
const { protect, allowedTo } = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");

// Validators
const { banAndWarnUserSchema, unBanAndUnwarnUserSchema } = require("../validators/adminAction.validator");

// -------------------------------------IMPORTS-------------------------------------

const adminActionRouter = express.Router();

adminActionRouter.use(protect, allowedTo("admin"));

// Route to get all user active warnings
adminActionRouter.get("/get-active-warnings/:userId", getUserActiveWarnings);
// Route to ban user
adminActionRouter.post("/ban/:userId", validate(banAndWarnUserSchema), banUser);
// Route to unban user
adminActionRouter.post("/unban/:userId/:banId", validate(unBanAndUnwarnUserSchema), unBanUser);
// Route to warn user
adminActionRouter.post("/warn/:userId", validate(banAndWarnUserSchema), warnUser);
// Route to unwarn user
adminActionRouter.post("/unwarn/:userId/:warnId", validate(unBanAndUnwarnUserSchema), unWarnUser);

module.exports = adminActionRouter;