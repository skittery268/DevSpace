/**
 * Locale configuration.
 *
 * Shared by the server (which resolves the locale from the request) and the
 * client (which switches it at runtime), so it must stay free of both
 * `next/headers` and browser globals.
 */

export const LOCALES = ["en", "ru", "ka"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Each language named in itself — never translated. */
export const LOCALE_NAMES: Record<Locale, string> = {
    en: "English",
    ru: "Русский",
    ka: "ქართული",
};

/** Short badge for the header switcher, where there is no room for a name. */
export const LOCALE_SHORT: Record<Locale, string> = {
    en: "EN",
    ru: "RU",
    ka: "KA",
};

/** BCP 47 tags for `Intl.NumberFormat` and `Intl.DateTimeFormat`. */
export const INTL_LOCALES: Record<Locale, string> = {
    en: "en-US",
    ru: "ru-RU",
    ka: "ka-GE",
};

/**
 * Read on both sides: the server resolves the initial locale from it, the
 * switcher writes it so the next request renders in the right language.
 * A cookie rather than localStorage precisely so the server can see it —
 * otherwise every visit would render English and snap over on hydration.
 */
export const LOCALE_COOKIE = "devspace-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
    return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale out of an `Accept-Language` header or a
 * `navigator.languages` list.
 *
 * Only the primary subtag is compared, so `ru-BY` and `ka-GE` both match.
 * Quality values are honoured, which is what makes `en;q=0.9, ru` prefer ru.
 */
export function matchLocale(
    accepted: string | readonly string[] | null | undefined,
): Locale | null {
    if (!accepted) return null;

    const entries = (
        Array.isArray(accepted) ? accepted.join(",") : String(accepted)
    )
        .split(",")
        .map((part) => {
            const [tag, ...params] = part.trim().split(";");
            const q = params
                .map((param) => param.trim())
                .find((param) => param.startsWith("q="));
            return {
                tag: tag.trim().toLowerCase(),
                quality: q ? Number.parseFloat(q.slice(2)) || 0 : 1,
            };
        })
        .filter((entry) => entry.tag)
        .sort((a, b) => b.quality - a.quality);

    for (const { tag } of entries) {
        const primary = tag.split("-")[0];
        const match = LOCALES.find((locale) => locale === primary);
        if (match) return match;
    }

    return null;
}
