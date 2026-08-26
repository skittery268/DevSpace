"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Theme preference.
 *
 * `system` is the default and follows `prefers-color-scheme`; the two explicit
 * values pin the theme regardless of the OS. The resolved value is applied as a
 * `dark` class on <html> by ThemeProvider, and re-applied before first paint by
 * the inline script in app/layout.tsx — the two must agree on this storage key
 * and on the shape zustand's `persist` writes.
 */
export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "devspace-theme";

interface ThemeState {
    preference: ThemePreference;
    /** What `preference` currently resolves to, once the browser has been asked. */
    resolved: ResolvedTheme;
    setPreference: (preference: ThemePreference) => void;
    setResolved: (resolved: ResolvedTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            preference: "system",
            // The server has no media query to read, so it assumes the light theme
            // and ThemeProvider corrects it on the first client pass.
            resolved: "light",
            setPreference: (preference) => set({ preference }),
            setResolved: (resolved) => set({ resolved }),
        }),
        {
            name: THEME_STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            version: 1,
            // `resolved` is derived from the OS every session; persisting it would
            // let a stale value win over the real media query.
            partialize: (state) => ({ preference: state.preference }),
        },
    ),
);
