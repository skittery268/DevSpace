import i18next, { type i18n as I18nInstance } from "i18next";

import { DEFAULT_LOCALE, type Locale } from "./config";
import { en } from "./locales/en";
import { ka } from "./locales/ka";
import { ru } from "./locales/ru";

/**
 * All three catalogs ship in the bundle.
 *
 * They are plain text and small next to the app itself, and having them present
 * is what makes switching language instant — no fetch, no loading state, no
 * flash of the previous language while a chunk arrives.
 */
export const resources = {
    en: { translation: en },
    ru: { translation: ru },
    ka: { translation: ka },
} as const;

export const DEFAULT_NS = "translation";

/**
 * A fresh, fully initialised i18next instance.
 *
 * Deliberately not a module-level singleton: the server renders many requests
 * concurrently and each one may be in a different language, so the locale can
 * never live in module scope. The client creates exactly one of these, inside
 * `I18nProvider`, and reuses it for the session.
 *
 * `initReactI18next` is skipped on purpose — it registers a *global* default
 * instance, which is precisely the shared mutable state SSR must avoid.
 * `I18nextProvider` hands the instance down through context instead.
 */
export function createI18n(locale: Locale): I18nInstance {
    const instance = i18next.createInstance();

    void instance.init({
        lng: locale,
        fallbackLng: DEFAULT_LOCALE,
        supportedLngs: Object.keys(resources),
        resources,
        defaultNS: DEFAULT_NS,
        ns: [DEFAULT_NS],
        // React escapes everything it renders; escaping again would turn a quote
        // in a category name into `&#39;`.
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
    });

    return instance;
}
