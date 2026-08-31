"use client";

import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { LOCALES, LOCALE_NAMES, LOCALE_SHORT } from "@/i18n/config";
import { useLocale } from "@/i18n/useLocale";
import { cn } from "@/lib/utils";

/**
 * Language picker for the header and the admin top bar.
 *
 * The language names are never translated — someone looking for their own
 * language scans for the word they already know, not for its English name — so
 * `LOCALE_NAMES` holds each one written in itself.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
    const { t } = useTranslation();
    const { locale, setLocale } = useLocale();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    return (
        <div ref={containerRef} className={cn("relative", className)}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={t("language.change")}
                title={t("language.current", { language: LOCALE_NAMES[locale] })}
                className={cn(
                    "touch-target inline-flex h-9.5 shrink-0 items-center gap-1.5 rounded-lg px-2 text-ink-600",
                    "transition-colors duration-200 hover:bg-ink-100 hover:text-ink-900 active:scale-95",
                )}
            >
                <Globe className="size-5" aria-hidden />
                <span className="text-xs font-semibold tracking-wide">
                    {LOCALE_SHORT[locale]}
                </span>
            </button>

            {open ? (
                <div
                    role="menu"
                    className="animate-scale-in absolute right-0 z-50 mt-2 w-44 max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-surface-2 py-1.5 elev-3"
                >
                    {LOCALES.map((option) => {
                        const active = option === locale;
                        return (
                            <button
                                key={option}
                                type="button"
                                role="menuitemradio"
                                aria-checked={active}
                                onClick={() => {
                                    setLocale(option);
                                    setOpen(false);
                                }}
                                className={cn(
                                    "touch-target-h flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                                    active
                                        ? "font-medium text-link"
                                        : "text-ink-700 hover:bg-ink-100 hover:text-ink-900",
                                )}
                            >
                                <span className="w-6 shrink-0 text-[0.6875rem] font-semibold tracking-wide text-ink-400">
                                    {LOCALE_SHORT[option]}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-left">
                                    {LOCALE_NAMES[option]}
                                </span>
                                {active ? (
                                    <Check className="size-4 shrink-0" aria-hidden />
                                ) : null}
                            </button>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}

/** The explicit three-way choice, for places with room for labels. */
export function LanguageSegmentedControl({ className }: { className?: string }) {
    const { t } = useTranslation();
    const { locale, setLocale } = useLocale();

    return (
        <div
            role="radiogroup"
            aria-label={t("language.label")}
            className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-lg border border-ink-200 bg-ink-100 p-1",
                className,
            )}
        >
            {LOCALES.map((option) => {
                const active = option === locale;
                return (
                    <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={LOCALE_NAMES[option]}
                        onClick={() => setLocale(option)}
                        className={cn(
                            "touch-target-h min-w-11 rounded-md px-2.5 py-1.5 text-xs font-medium max-sm:flex-1",
                            "transition-[background-color,color,box-shadow] duration-200",
                            active
                                ? "bg-surface text-ink-900 elev-1"
                                : "text-ink-500 hover:text-ink-800",
                        )}
                    >
                        {LOCALE_SHORT[option]}
                    </button>
                );
            })}
        </div>
    );
}
