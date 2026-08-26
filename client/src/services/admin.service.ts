import { api } from "./api";

import type { ApiEnvelope } from "@/types/api.types";
import type {
    BanUserPayload,
    UnBanUserPayload,
    UnWarnUserPayload,
    WarnResult,
    WarnUserPayload,
} from "@/types/moderation.types";
import type { ApiAdminAction } from "@/types/user.types";

/** Every `/api/v1/admin/*` route is `protect, allowedTo("admin")`. */

/**
 * `GET /admin/get-active-warnings/:userId`
 *
 * Returns only warnings. There is no endpoint listing a user's bans — the id of
 * an active ban is read from `user.moderation.activeBan` in the user list.
 */
export async function getActiveWarnings(userId: string): Promise<ApiAdminAction[]> {
    const { data } = await api.get<ApiEnvelope<{ activeWarnings: ApiAdminAction[] }>>(
        `/admin/get-active-warnings/${userId}`,
    );
    return data.data.activeWarnings;
}

/** `POST /admin/ban/:userId` — 400 if the user already has an active ban. */
export async function banUser({
    userId,
    ...body
}: BanUserPayload): Promise<ApiAdminAction> {
    const { data } = await api.post<ApiEnvelope<{ ban: ApiAdminAction }>>(
        `/admin/ban/${userId}`,
        body,
    );
    return data.data.ban;
}

/** `POST /admin/unban/:userId/:banId` */
export async function unBanUser({
    userId,
    banId,
    reason,
}: UnBanUserPayload): Promise<ApiAdminAction> {
    const { data } = await api.post<ApiEnvelope<{ unBan: ApiAdminAction }>>(
        `/admin/unban/${userId}/${banId}`,
        { reason },
    );
    return data.data.unBan;
}

/**
 * `POST /admin/warn/:userId`
 *
 * The third active warning auto-issues a 10-day system ban, and the response
 * then carries the **ban** document instead of the warning — callers should
 * check `type` rather than assume.
 */
export async function warnUser({
    userId,
    ...body
}: WarnUserPayload): Promise<WarnResult> {
    const { data } = await api.post<ApiEnvelope<{ warn: WarnResult }>>(
        `/admin/warn/${userId}`,
        body,
    );
    return data.data.warn;
}

/** `POST /admin/unwarn/:userId/:warnId` */
export async function unWarnUser({
    userId,
    warnId,
    reason,
}: UnWarnUserPayload): Promise<ApiAdminAction> {
    const { data } = await api.post<ApiEnvelope<{ unWarn: ApiAdminAction }>>(
        `/admin/unwarn/${userId}/${warnId}`,
        { reason },
    );
    return data.data.unWarn;
}
