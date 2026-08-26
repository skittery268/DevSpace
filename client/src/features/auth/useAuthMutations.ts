"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useErrorMessage } from "@/hooks/useErrorMessage";
import { ApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import * as authService from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";
import { toast } from "@/store/toast.store";
import type { ApiUser } from "@/types/user.types";

/**
 * A successful sign-in has to land in two places: TanStack Query's cache (so a
 * later refetch has a baseline) and the auth store (so the header updates
 * immediately without waiting for a round trip).
 */
function useSessionSync() {
    const queryClient = useQueryClient();
    const setUser = useAuthStore((state) => state.setUser);

    return (user: ApiUser | null) => {
        queryClient.setQueryData(queryKeys.auth.me, user ?? undefined);
        setUser(user);
    };
}

export function useRegister() {
    return useMutation<string, ApiError, authService.RegisterInput>({
        mutationFn: authService.register,
    });
}

export function useLogin() {
    const syncSession = useSessionSync();

    return useMutation<authService.LoginResponse, ApiError, authService.LoginInput>({
        mutationFn: authService.login,
        onSuccess: (result) => {
            // A 2FA challenge leaves the session unauthenticated on purpose: the
            // `at` cookie is only issued after the TOTP step.
            if (!result.requires2FA) syncSession(result.user);
        },
    });
}

export function useVerify2FALogin() {
    const syncSession = useSessionSync();

    return useMutation<ApiUser, ApiError, string>({
        mutationFn: authService.verify2FALogin,
        onSuccess: (user) => syncSession(user),
    });
}

export function useLogout() {
    const { t } = useTranslation();
    const errorMessage = useErrorMessage();
    const queryClient = useQueryClient();
    const resetAuth = useAuthStore((state) => state.reset);
    const router = useRouter();

    return useMutation<void, ApiError>({
        mutationFn: authService.logout,
        onSuccess: () => {
            resetAuth();
            // Everything cached was fetched as this user; none of it survives sign-out.
            // The cart is deliberately left alone: it is anonymous, local state.
            queryClient.clear();
            toast.success(t("toast.signedOut"));
            router.push("/");
        },
        onError: (error) =>
            toast.error(t("toast.signOutFailed"), errorMessage(error)),
    });
}

export function useForgotPassword() {
    return useMutation<string, ApiError, string>({
        mutationFn: authService.forgotPassword,
    });
}

export function useResetPassword() {
    return useMutation<string, ApiError, authService.ResetPasswordInput>({
        mutationFn: authService.resetPassword,
    });
}

export function useSetup2FA() {
    return useMutation<string, ApiError, string>({
        mutationFn: authService.setup2FA,
    });
}

export function useVerify2FASetup() {
    const queryClient = useQueryClient();

    return useMutation<string, ApiError, string>({
        mutationFn: authService.verify2FASetup,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
        },
    });
}

export function useDisable2FA() {
    const queryClient = useQueryClient();

    return useMutation<string, ApiError, string>({
        mutationFn: authService.disable2FA,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
        },
    });
}
