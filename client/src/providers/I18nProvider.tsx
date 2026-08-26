"use client";

import { useEffect, useState, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";

import {
    LOCALE_COOKIE,
    LOCALE_COOKIE_MAX_AGE,
    type Locale,
} from "@/i18n/config";
import { createI18n } from "@/i18n/instance";

/**
 * Holds the one i18next instance the browser uses for the session.
 *
 * `initialLocale` comes from the server, which resolved it from the cookie or
 * `Accept-Language`, so the first client render already agrees with the markup
 * React is hydrating — no mismatch, and no flash of English.
 *
 * The prop is deliberately read once. After mount the language is driven from
 * the client (`useSetLocale` below), and `router.refresh()` re-renders the
 * server tree while this provider stays mounted; syncing from the prop would
 * let a stale server value fight the choice the user just made.
 */
export function I18nProvider({
    initialLocale,
    children,
}: {
    initialLocale: Locale;
    children: ReactNode;
}) {
    const [instance] = useState(() => createI18n(initialLocale));

    // `<html lang>` is server-rendered; keep it truthful after a client switch so
    // screen readers and the browser's own translation prompt stay correct.
    useEffect(() => {
        const apply = (language: string) => {
            document.documentElement.lang = language;
        };

        apply(instance.resolvedLanguage ?? initialLocale);
        instance.on("languageChanged", apply);
        return () => {
            instance.off("languageChanged", apply);
        };
    }, [instance, initialLocale]);

    return <I18nextProvider i18n={instance}>{children}</I18nextProvider>;
}

/**
 * Persists the choice for the next visit — and for the next server render,
 * which is what makes the language survive a reload without a flash.
 */
export function persistLocale(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}
