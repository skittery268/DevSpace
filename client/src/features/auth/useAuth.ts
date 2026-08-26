"use client";

import { useAuthStore } from "@/store/auth.store";
import type { Role } from "@/types/user.types";

/**
 * The single read-side entry point for session state.
 *
 * `AuthProvider` owns the `GET /auth/me` request; components read the result
 * from here so nothing has to know about query keys just to check a role.
 */
export function useAuth() {
    const user = useAuthStore((state) => state.user);
    const status = useAuthStore((state) => state.status);

    return {
        user,
        status,
        isLoading: status === "loading",
        isAuthenticated: status === "authenticated" && user !== null,
        role: user?.role ?? null,
        hasRole: (...roles: Role[]) => Boolean(user && roles.includes(user.role)),
    };
}
