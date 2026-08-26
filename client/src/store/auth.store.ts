"use client";

import { create } from "zustand";

import type { ApiUser } from "@/types/user.types";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthState {
    user: ApiUser | null;
    status: AuthStatus;
    setUser: (user: ApiUser | null) => void;
    setStatus: (status: AuthStatus) => void;
    reset: () => void;
}

/**
 * Client-side mirror of the session, fed by the `GET /auth/me` query in
 * AuthProvider.
 *
 * There is deliberately no token here: the session lives in an httpOnly cookie
 * the browser attaches on its own, so the only thing worth caching is who the
 * user is. This store is never persisted — a stale "logged in" flag surviving a
 * cleared cookie would be worse than a brief loading state.
 */
export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    status: "loading",
    setUser: (user) =>
        set({ user, status: user ? "authenticated" : "anonymous" }),
    setStatus: (status) => set({ status }),
    reset: () => set({ user: null, status: "anonymous" }),
}));
