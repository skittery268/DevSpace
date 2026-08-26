import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Number, currency and date formatting live in `@/i18n/useFormat`.
 *
 * They were module-level `Intl` formatters pinned to `en-US`; they are a hook
 * now because the locale differs per render — and, on the server, per request —
 * so it can never be captured in module scope.
 *
 * `pluralize` is gone with them: i18next selects the plural form from
 * `Intl.PluralRules`, which is the only way Russian's one/few/many can be
 * correct without a rule table of our own.
 */

export function initialsOf(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? "")
        .join("");
}

export function truncate(value: string, max: number): string {
    return value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`;
}

/** Total pages for a `{ total, limit }` pair; never below 1 so the UI always has a page. */
export function pageCount(total: number, limit: number): number {
    if (limit <= 0) return 1;
    return Math.max(1, Math.ceil(total / limit));
}

/** Reads a single value out of a `?page=1&page=2` style search param. */
export function readNumberParam(
    value: string | null | undefined,
    fallback: number,
): number {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    const truncated = Math.trunc(parsed);
    return truncated >= 1 ? truncated : fallback;
}

/**
 * Turns an attribute key into a label.
 *
 * Category attributes are authored as identifiers (`fieldOfView`, `releaseYear`,
 * `frame_rate`), and a bare `capitalize` leaves them unreadable — so the words
 * are split out before the first letter is raised.
 */
export function humanizeKey(key: string): string {
    const spaced = key
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
        .trim();

    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
