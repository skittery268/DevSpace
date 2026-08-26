"use client";

import { useEffect, type ReactNode } from "react";

import {
    useThemeStore,
    type ResolvedTheme,
    type ThemePreference,
} from "@/store/theme.store";

const DARK_QUERY = "(prefers-color-scheme: dark)";

function resolve(preference: ThemePreference): ResolvedTheme {
    if (preference !== "system") return preference;
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

function apply(theme: ResolvedTheme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
}

/**
 * Keeps the `dark` class on <html> in step with the stored preference.
 *
 * The class is already correct on arrival — `app/layout.tsx` inlines a script
 * that reads the same storage key before the first paint — so this provider
 * only has to handle changes: a click on the toggle, a rehydration from
 * localStorage, or the OS flipping while the tab is open.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
    const preference = useThemeStore((state) => state.preference);
    const setResolved = useThemeStore((state) => state.setResolved);

    useEffect(() => {
        const media = window.matchMedia(DARK_QUERY);

        const sync = () => {
            const theme = resolve(preference);
            apply(theme);
            setResolved(theme);
        };

        sync();

        // Only a `system` preference cares what the OS is doing.
        if (preference !== "system") return;
        media.addEventListener("change", sync);
        return () => media.removeEventListener("change", sync);
    }, [preference, setResolved]);

    return <>{children}</>;
}

/**
 * The blocking script that runs before the first paint.
 *
 * Without it the page would render light and snap to dark once React hydrates.
 * It is deliberately dependency-free and tolerant of malformed storage.
 */
export const themeBootstrapScript = `(function(){try{
var raw=localStorage.getItem("devspace-theme");
var pref=raw?(JSON.parse(raw).state||{}).preference:null;
if(pref!=="light"&&pref!=="dark"){pref=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}
var el=document.documentElement;
if(pref==="dark"){el.classList.add("dark");}
el.style.colorScheme=pref;
}catch(e){}})();`;
