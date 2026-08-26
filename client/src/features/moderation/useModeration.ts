"use client";

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import * as adminService from "@/services/admin.service";
import * as userService from "@/services/user.service";
import type { Paginated } from "@/types/api.types";
import type {
    BanUserPayload,
    UnBanUserPayload,
    UnWarnUserPayload,
    WarnResult,
    WarnUserPayload,
} from "@/types/moderation.types";
import type { ApiAdminAction, ApiUser } from "@/types/user.types";

export function useUsers(page: number, limit = DEFAULT_PAGE_SIZE) {
    return useQuery<Paginated<ApiUser>, ApiError>({
        queryKey: queryKeys.users.list({ page, limit }),
        queryFn: () => userService.getUsers({ page, limit }),
        placeholderData: keepPreviousData,
    });
}

export function useActiveWarnings(userId: string | null) {
    return useQuery<ApiAdminAction[], ApiError>({
        queryKey: queryKeys.moderation.warnings(userId ?? ""),
        queryFn: () => adminService.getActiveWarnings(userId!),
        enabled: Boolean(userId),
    });
}

/**
 * Any moderation write can change a user's `moderation.activeBan` pointer and
 * their warning count, so both lists are refreshed together.
 */
function useModerationInvalidation() {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.moderation.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
    };
}

export function useBanUser() {
    const invalidate = useModerationInvalidation();

    return useMutation<ApiAdminAction, ApiError, BanUserPayload>({
        mutationFn: adminService.banUser,
        onSuccess: invalidate,
    });
}

export function useUnBanUser() {
    const invalidate = useModerationInvalidation();

    return useMutation<ApiAdminAction, ApiError, UnBanUserPayload>({
        mutationFn: adminService.unBanUser,
        onSuccess: invalidate,
    });
}

/** The result is a ban document when the third warning triggers an auto-ban. */
export function useWarnUser() {
    const invalidate = useModerationInvalidation();

    return useMutation<WarnResult, ApiError, WarnUserPayload>({
        mutationFn: adminService.warnUser,
        onSuccess: invalidate,
    });
}

export function useUnWarnUser() {
    const invalidate = useModerationInvalidation();

    return useMutation<ApiAdminAction, ApiError, UnWarnUserPayload>({
        mutationFn: adminService.unWarnUser,
        onSuccess: invalidate,
    });
}

export function useDeleteUser() {
    const invalidate = useModerationInvalidation();

    return useMutation<void, ApiError, string>({
        mutationFn: userService.deleteUser,
        onSuccess: invalidate,
    });
}
