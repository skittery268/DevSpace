"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";

import { queryKeys } from "@/lib/query-keys";
import { getMe } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

/**
 * Resolves the session once at startup and keeps the auth store in sync.
 *
 * The session cookie is httpOnly, so `GET /auth/me` is the only way to learn
 * who is signed in. A 401 there is the normal "anonymous visitor" answer, not
 * an error worth surfacing.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const setUser = useAuthStore((state) => state.setUser);
    const setStatus = useAuthStore((state) => state.setStatus);

    const { data, isSuccess, isError, isPending } = useQuery({
        queryKey: queryKeys.auth.me,
        queryFn: getMe,
        retry: false,
        staleTime: 5 * 60_000,
    });

    useEffect(() => {
        if (isPending) {
            setStatus("loading");
            return;
        }
        if (isSuccess) {
            setUser(data);
            return;
        }
        if (isError) {
            setUser(null);
        }
    }, [data, isSuccess, isError, isPending, setUser, setStatus]);

    return <>{children}</>;
}
