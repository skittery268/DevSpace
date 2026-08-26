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
