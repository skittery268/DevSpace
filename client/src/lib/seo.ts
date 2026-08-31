import type { Metadata } from "next";

import { APP_NAME } from "./constants";
import type { Locale } from "@/i18n/config";

/**
 * Shared SEO primitives.
 *
 * Everything here is about turning backend data into tags a crawler can trust:
 * absolute URLs, descriptions that fit, and titles that survive a seller typing
 * 200 characters into a product name. Nothing in this file invents content.
 */

/**
 * The public origin, which is what every canonical and Open Graph URL is built
 * from. It is deliberately not the API origin: `NEXT_PUBLIC_API_URL` points at
 * the Express backend, while this is where the storefront itself is served.
 *
 * Falls back to the dev port rather than throwing, so a missing variable
 * degrades to wrong-but-working localhost URLs instead of breaking the build.
 */
export const SITE_URL = (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"
).replace(/\/+$/, "");

/** `new URL()` for `metadataBase`, which will not take a string. */
export const METADATA_BASE = new URL(SITE_URL);

/** A site-relative path turned into the absolute URL crawlers and OG need. */
export function absoluteUrl(path: string): string {
    return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * `og:locale` values for the three catalogs. These are the same languages as
 * `INTL_LOCALES`, but in Open Graph's underscore form rather than BCP 47.
 */
export const OG_LOCALES: Record<Locale, string> = {
    en: "en_US",
    ru: "ru_RU",
    ka: "ka_GE",
};

/** Google renders roughly 160 characters of a description, and 60 of a title. */
const DESCRIPTION_LIMIT = 160;
const TITLE_LIMIT = 70;

/**
 * Collapses the whitespace a textarea leaves behind and cuts on a word
 * boundary, so a truncated description never ends mid-word or mid-newline.
 */
function condense(text: string, limit: number): string {
    const flat = text.replace(/\s+/g, " ").trim();
    if (flat.length <= limit) return flat;

    // -1 leaves room for the ellipsis that replaces the cut.
    const clipped = flat.slice(0, limit - 1);
    const lastSpace = clipped.lastIndexOf(" ");
    return `${(lastSpace > limit * 0.6 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

/**
 * A description tag built from seller- or admin-written copy.
 *
 * Product and category descriptions are free text with no length rule on the
 * backend, so they arrive empty, one word long, or several paragraphs long. The
 * fallback covers the empty case; `condense` covers the long one.
 */
export function toMetaDescription(
    raw: string | null | undefined,
    fallback: string,
): string {
    const text = raw?.trim();
    return text ? condense(text, DESCRIPTION_LIMIT) : condense(fallback, DESCRIPTION_LIMIT);
}

/**
 * A page title built from a user-supplied name.
 *
 * The root layout appends ` · DevSpace` through its template, so this trims the
 * entity's own name and leaves the suffix room to survive.
 */
export function toMetaTitle(raw: string, fallback: string): string {
    const text = raw.trim();
    return text ? condense(text, TITLE_LIMIT) : fallback;
}

/**
 * Pages that must never enter an index.
 *
 * `follow` stays on for the storefront's own private pages — a crawler that
 * reaches the cart should still be free to walk the product links on it — and
 * is turned off only for the staff consoles, which link nowhere useful.
 */
export const NOINDEX: Metadata["robots"] = {
    index: false,
    follow: true,
};

/** For `/admin` and `/seller`: no index, and nothing worth following either. */
export const NOINDEX_NOFOLLOW: Metadata["robots"] = {
    index: false,
    follow: false,
    nocache: true,
};

/**
 * Canonical for a paginated list.
 *
 * Google's guidance is that a paginated page canonicalises to *itself*, not to
 * page one — collapsing them all onto the first page hides everything past it.
 * Page one drops the parameter so `/products` and `/products?page=1` do not
 * become two URLs for the same content.
 */
export function paginatedCanonical(path: string, page: number): string {
    return page > 1 ? `${path}?page=${page}` : path;
}

/**
 * Reads `?page=` the way `usePageParam` does on the client, so the canonical a
 * crawler is given matches the page a visitor actually sees.
 */
export function readPageParam(value: string | string[] | undefined): number {
    const raw = Array.isArray(value) ? value[0] : value;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed > 1 ? Math.trunc(parsed) : 1;
}

export { APP_NAME };
