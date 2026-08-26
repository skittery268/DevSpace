"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { persistLocale } from "@/providers/I18nProvider";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

/**
 * The active locale, and the one way to change it.
 *
 * Switching does three things, in this order:
 *   1. `changeLanguage` — every component using `useTranslation` re-renders
 *      immediately, so the visible interface turns over without a reload;
 *   2. the cookie — so the next request is server-rendered in this language;
 *   3. `router.refresh()` — catches the few strings that live in server
 *      components (page titles, the skip link) in the background, without
 *      touching client state or losing the user's place.
 */
export function useLocale() {
    const { i18n } = useTranslation();
    const router = useRouter();

    const current = i18n.resolvedLanguage ?? i18n.language;
    const locale: Locale = isLocale(current) ? current : DEFAULT_LOCALE;

    const setLocale = useCallback(
        (next: Locale) => {
            if (next === locale) return;
            void i18n.changeLanguage(next);
            persistLocale(next);
            router.refresh();
        },
        [i18n, locale, router],
    );

    return { locale, setLocale };
}
