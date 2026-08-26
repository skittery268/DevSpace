/** server/models/user.model.js */

export const ROLES = ["user", "seller", "moderator", "admin"] as const;
export type Role = (typeof ROLES)[number];

export type AuthProvider = "local" | "google";

/**
 * A user document as it comes back from the API.
 *
 * `password`, `twoFactorSecret`, `passwordResetCode`, `resetPasswordExpires`
 * and `resetPasswordAttempts` are `select: false` in the schema and are never
 * serialized, so they are intentionally absent here.
 *
 * `moderation.activeBan` is populated (an object) on `/auth/me` and `/auth/login`
 * because `protect` populates it, but stays a raw id string on `GET /users`
 * which uses `.lean()` without populate.
 */
export interface ApiUser {
    _id: string;
    fullname: string;
    email: string;
    role: Role;
    provider: AuthProvider;
    googleId?: string;
    isVerified: boolean;
    twoFactorEnabled: boolean;
    isDeleted: boolean;
    deletedAt?: string;
    moderation?: {
        activeBan: ApiAdminAction | string | null;
    };
    createdAt: string;
    updatedAt: string;
}

/** server/models/adminAction.model.js */
export type AdminActionType = "warn" | "ban" | "unban" | "unwarn";

export interface ApiAdminAction {
    _id: string;
    type: AdminActionType;
    /** The moderated user (the target), not the actor. */
    user: string;
    /** The admin who performed the action. */
    administrator: string;
    reason: string;
    /** `null` means the sanction never expires. */
    expiresAt: string | null;
    /** The ban/warn this unban/unwarn reverses. */
    targetAction: string | null;
    createdAt: string;
    updatedAt: string;
}
