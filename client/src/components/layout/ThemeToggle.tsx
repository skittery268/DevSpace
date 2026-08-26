"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { cn } from "@/lib/utils";
import { useThemeStore, type ThemePreference } from "@/store/theme.store";

const OPTIONS: Array<{
    value: ThemePreference;
    labelKey: "theme.light" | "theme.system" | "theme.dark";
    icon: typeof Sun;
}> = [
    { value: "light", labelKey: "theme.light", icon: Sun },
    { value: "system", labelKey: "theme.system", icon: Monitor },
    { value: "dark", labelKey: "theme.dark", icon: Moon },
];

/**
 * Compact toggle for the header.
 *
 * One click flips to the opposite theme and pins it. The three-way choice —
 * including "follow the system" — lives in `ThemeSegmentedControl`, which the
 * mobile drawer and the footer render where there is room to label it.
 *
 * Until the store has read localStorage the icon is rendered in its light-mode
 * state to match the server markup, and swapped on the first client pass.
 */
export function ThemeToggle({ className }: { className?: string }) {
    const { t } = useTranslation();
    const hydrated = useStoreHydrated(useThemeStore);
    const resolved = useThemeStore((state) => state.resolved);
    const setPreference = useThemeStore((state) => state.setPreference);

    const isDark = hydrated && resolved === "dark";

    return (
        <button
            type="button"
            onClick={() => setPreference(isDark ? "light" : "dark")}
            aria-label={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
            title={isDark ? t("theme.switchToLight") : t("theme.switchToDark")}
            className={cn(
                "relative inline-flex size-9.5 items-center justify-center rounded-lg text-ink-600",
                "transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900 active:scale-95",
                className,
            )}
        >
            {/* Both glyphs are mounted and cross-faded, so the swap is a rotation
                    rather than a pop-in. */}
            <Sun
                aria-hidden
                className={cn(
                    "absolute size-5 transition-all duration-300 ease-out",
                    isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
                )}
            />
            <Moon
                aria-hidden
                className={cn(
                    "absolute size-5 transition-all duration-300 ease-out",
                    isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
                )}
            />
        </button>
    );
}

/** The explicit three-way choice, for places with room for labels. */
export function ThemeSegmentedControl({ className }: { className?: string }) {
    const { t } = useTranslation();
    const hydrated = useStoreHydrated(useThemeStore);
    const preference = useThemeStore((state) => state.preference);
    const setPreference = useThemeStore((state) => state.setPreference);

    return (
        <div
            role="radiogroup"
            aria-label={t("theme.colourTheme")}
            className={cn(
                "inline-flex items-center gap-1 rounded-lg border border-ink-200 bg-ink-100 p-1",
                className,
            )}
        >
            {OPTIONS.map(({ value, labelKey, icon: Icon }) => {
                const active = hydrated && preference === value;
                return (
                    <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setPreference(value)}
                        className={cn(
                            "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
                            "transition-[background-color,color,box-shadow] duration-200",
                            active
                                ? "bg-surface text-ink-900 elev-1"
                                : "text-ink-500 hover:text-ink-800",
                        )}
                    >
                        <Icon className="size-3.5" aria-hidden />
                        {t(labelKey)}
                    </button>
                );
            })}
        </div>
    );
}
