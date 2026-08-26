"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/**
 * Header search box.
 *
 * It only routes: `/search` owns the request, the debouncing and the tabs.
 * Every `/search/*` endpoint sits behind `protect`, so the header renders this
 * for signed-in visitors only rather than sending anyone into a 401.
 */
export function HeaderSearch({
    className,
    autoFocus = false,
    onSubmitted,
}: {
    className?: string;
    autoFocus?: boolean;
    onSubmitted?: () => void;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const [term, setTerm] = useState("");

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        const trimmed = term.trim();
        router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
        onSubmitted?.();
    };

    return (
        <form
            role="search"
            onSubmit={onSubmit}
            className={cn("relative flex-1", className)}
        >
            <Search
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
            />
            <input
                type="search"
                value={term}
                autoFocus={autoFocus}
                onChange={(event) => setTerm(event.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                aria-label={t("nav.searchProducts")}
                className={cn(
                    "h-10 w-full rounded-lg border border-ink-200 bg-ink-100/70 pl-10 pr-3 text-sm text-ink-900",
                    "placeholder:text-ink-400 transition-[border-color,background-color,box-shadow] duration-200",
                    "hover:border-ink-300 hover:bg-ink-100 focus:border-brand-400 focus:bg-surface",
                    "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-ring)_18%,transparent)]",
                )}
            />
        </form>
    );
}
