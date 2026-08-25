// Models
const AdminAction = require("../models/adminAction.model");
const User = require("../models/user.model");

// Utils
const AppError = require("../utils/appError.util");

// -------------------------------------IMPORTS-------------------------------------

// Service to get user active warnings
const getActiveWarningsService = async (userId) => {
    const warns = await AdminAction.find({ 
        type: "warn", 
        user: userId,
        $or: [
            { expiresAt: { $gt: Date.now() } },
            { expiresAt: null }
        ]
    });

    return warns;
};

// Service to get user active bans
const getActiveBanService = async (userId) => {
    const ban = await AdminAction.findOne({ 
        type: "ban", 
        user: userId,
        $or: [
            { expiresAt: { $gt: Date.now() } },
            { expiresAt: null }
        ]
    });

    return ban;
};

// Service to warn user
const issueWarningService = async (userId, adminId, reason, expiresAt = null) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found!", 404);
    };

    const warn = await AdminAction.create({ 
        type: "warn", 
        user: userId, 
        administrator: 
        adminId, 
        reason, 
        expiresAt: expiresAt === null ? expiresAt : new Date(Date.now() + parseInt(expiresAt) * 24 * 60 * 60 * 1000)
    });

    const warns = await getActiveWarningsService(userId);

    if (warns.length >= 3) {
        const activeBan = await getActiveBanService(userId);

        if (activeBan) {
            return warn;
        }

        const TEN_DAYS = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

        const ban = await AdminAction.create({ 
            type: "ban", 
            user: userId, 
            administrator: adminId, 
            reason: "[SYSTEM]: Repeated violations: 3 active warnings.", 
            expiresAt: TEN_DAYS 
        });

        await User.findOneAndUpdate({ _id: userId }, { $set: { "moderation.activeBan": ban._id } });

        warns.forEach(async (w) => {
            w.expiresAt = Date.now();

            await w.save();
        });

        return ban;
    };

    return warn;
};

// Service to ban user
const issueBanService = async (userId, adminId, reason, expiresAt = null) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found!", 404);
    };

    const activeBan = await getActiveBanService(userId);

    if (activeBan) {
        throw new AppError("User already have an active ban!", 400);
    };

    const ban = await AdminAction.create({
        type: "ban",
        user: userId,
        administrator: adminId,
        reason,
        expiresAt: expiresAt === null ? expiresAt : new Date(Date.now() + parseInt(expiresAt) * 24 * 60 * 60 * 1000)
    });

    await User.findOneAndUpdate({ _id: userId }, { $set: { "moderation.activeBan": ban._id } });

    return ban;
};

// Service to unbun user
const unBanService = async (userId, adminId, reason, banId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found!", 404);
    };

    const ban = await AdminAction.findById(banId);

    if (!ban || ban.type !== "ban") {
        throw new AppError("Ban not found!", 404);
    };

    const activeBan = await getActiveBanService(userId);

    if (!activeBan) {
        throw new AppError("User does not have an active ban", 400);
    };

    const unBun = await AdminAction.create({
        type: "unban",
        user: userId,
        administrator: adminId,
        reason,
        targetAction: banId
    });

    activeBan.expiresAt = Date.now();

    await activeBan.save();

    await User.findOneAndUpdate({ _id: userId }, { $set: { "moderation.activeBan": null } });

    return unBun;
};

// Service to unwarn user
const unWarnService = async (userId, adminId, reason, warnId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new AppError("User not found!", 404);
    };

    const warn = await AdminAction.findById(warnId);

    if (!warn) {
        throw new AppError("Warn not found!", 404);
    };

    const unWarn = await AdminAction.create({
        type: "unwarn",
        user: userId,
        administrator: adminId,
        reason,
        targetAction: warnId
    });

    warn.expiresAt = Date.now();

    await warn.save();

    return unWarn;
};

module.exports = {
    getActiveWarningsService,
    getActiveBanService,
    issueWarningService,
    issueBanService,
    unBanService,
    unWarnService
};