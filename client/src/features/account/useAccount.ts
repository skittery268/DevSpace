"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import * as userService from "@/services/user.service";
import { useAuthStore } from "@/store/auth.store";

/**
 * Self-service edits to your own account.
 *
 * Every endpoint here compares `:id` against the session and refuses anyone
 * else — administrators included — so none of this is a moderation tool. The
 * admin-facing user calls live in features/moderation/useModeration.ts.
 */

/**
 * `PATCH /users/fullname/:id`.
 *
 * The response is only `{ status, message }`, so the new name is written into
 * the auth store directly instead of refetching `/auth/me` for one field. The
 * cached session object is updated in step, keeping the header, the profile
 * card and any later `getMe` baseline in agreement.
 */
export function useUpdateFullname() {
    const queryClient = useQueryClient();
    const user = useAuthStore((state) => state.user);
    const setUser = useAuthStore((state) => state.setUser);

    return useMutation<string, ApiError, { userId: string; fullname: string }>({
        mutationFn: ({ userId, fullname }) =>
            userService.updateFullname(userId, fullname),
        onSuccess: (_message, { fullname }) => {
            if (user) {
                const next = { ...user, fullname };
                setUser(next);
                queryClient.setQueryData(queryKeys.auth.me, next);
            }
            // A seller's name rides along on their product rows.
            void queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
        },
    });
}

/** `POST /users/email/setup/:id` — mails a code to the address on file. */
export function useRequestEmailChangeCode() {
    return useMutation<string, ApiError, string>({
        mutationFn: userService.requestEmailChangeCode,
    });
}

/**
 * `PATCH /users/email/verify`.
 *
 * Nothing is written to the session on success on purpose: the controller sets
 * `isVerified = false`, which makes `protect` answer 401 to everything that
 * follows. The caller signs out instead — see ChangeEmailDialog.
 */
export function useVerifyEmailChange() {
    return useMutation<string, ApiError, userService.VerifyEmailChangeInput>({
        mutationFn: userService.verifyEmailChange,
    });
}
