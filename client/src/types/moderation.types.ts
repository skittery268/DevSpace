import type { ApiAdminAction } from "./user.types";

export interface BanUserPayload {
    userId: string;
    reason: string;
    /**
     * A number of **days**, not a date: the service turns it into
     * `Date.now() + expiresAt * 24 * 60 * 60 * 1000`.
     * Omitting it produces a permanent sanction (`expiresAt: null`).
     */
    expiresAt?: number;
}

export type WarnUserPayload = BanUserPayload;

export interface UnBanUserPayload {
    userId: string;
    banId: string;
    reason: string;
}

export interface UnWarnUserPayload {
    userId: string;
    warnId: string;
    reason: string;
}

/**
 * `warnUser` returns a **ban** document instead of the warn when the third
 * active warning triggers the automatic 10-day escalation.
 */
export type WarnResult = ApiAdminAction;
