import { api, toPageParams } from "./api";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { pageCount } from "@/lib/utils";
import type { ApiEnvelope, Paginated, PaginationParams } from "@/types/api.types";
import type { ApiUser } from "@/types/user.types";

type UserListBody = ApiEnvelope<{ users: ApiUser[] }> & { userCount: number };

/** `GET /users` — admin only; excludes soft-deleted accounts. */
export async function getUsers({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
}: PaginationParams = {}): Promise<Paginated<ApiUser>> {
    const { data } = await api.get<UserListBody>("/users", {
        params: toPageParams(page, limit),
    });

    return {
        items: data.data.users,
        total: data.userCount,
        page,
        limit,
        pageCount: pageCount(data.userCount, limit),
    };
}

/**
 * `DELETE /users/:id` — the account owner or an admin. Soft delete: the account
 * is flagged and its email is rewritten, but products, reviews and orders stay.
 */
export async function deleteUser(userId: string): Promise<void> {
    await api.delete(`/users/${userId}`);
}

/**
 * `PATCH /users/fullname/:id` — the account owner only.
 *
 * The controller compares `:id` against the session and answers 403 for anyone
 * else, admins included, so this is a self-service call and nothing more.
 * Zod requires 5–50 characters. The response is `{ status, message }` with no
 * user document, so the caller has to refetch `/auth/me` to see the new name.
 */
export async function updateFullname(
    userId: string,
    fullname: string,
): Promise<string> {
    const { data } = await api.patch<{ status: "success"; message: string }>(
        `/users/fullname/${userId}`,
        { fullname },
    );
    return data.message;
}

/**
 * `POST /users/email/setup/:id` — the account owner only.
 *
 * Mails a six-digit code to the address **currently** on the account, not to
 * the new one, and stores its hash with a short expiry. Sending it again resets
 * the attempt counter, which is what makes "resend" a real recovery from the
 * five-failure lockout.
 */
export async function requestEmailChangeCode(userId: string): Promise<string> {
    const { data } = await api.post<{ status: "success"; message: string }>(
        `/users/email/setup/${userId}`,
    );
    return data.message;
}

export interface VerifyEmailChangeInput {
    /** The address the account has now — the code was mailed there. */
    email: string;
    code: string;
    password: string;
    newEmail: string;
}

/**
 * `PATCH /users/email/verify` — the account owner only.
 *
 * On success the controller sets `isVerified = false` and mails a fresh
 * verification link. `protect` rejects an unverified account with a 401, so
 * **the session dies the moment this succeeds** — every later request fails
 * until the link in the new inbox is opened. The UI signs the user out itself
 * rather than letting them walk into a wall of 401s.
 *
 * It also re-checks the account password, which a Google-provisioned account
 * does not have, so the flow is not offered to those accounts.
 */
export async function verifyEmailChange(
    input: VerifyEmailChangeInput,
): Promise<string> {
    const { data } = await api.patch<{ status: "success"; message: string }>(
        "/users/email/verify",
        input,
    );
    return data.message;
}
