import { cookies, headers } from "next/headers";

import {
    DEFAULT_LOCALE,
    isLocale,
    LOCALE_COOKIE,
    matchLocale,
    type Locale,
} from "./config";
import { createI18n } from "./instance";

/**
 * The locale for the current request. Server components only.
 *
 * Order of preference, which is also the order the requirement states:
 *   1. the cookie the switcher wrote — an explicit choice always wins;
 *   2. `Accept-Language`, so a first visit already arrives in the right
 *      language rather than rendering English and snapping over on hydration;
 *   3. English.
 *
 * Reading a cookie opts the route into dynamic rendering, which is the price of
 * getting the first paint right. Nothing here is statically cacheable anyway —
 * every page reads a session-scoped API.
 */
export async function getRequestLocale(): Promise<Locale> {
    const cookieStore = await cookies();
    const stored = cookieStore.get(LOCALE_COOKIE)?.value;
    if (isLocale(stored)) return stored;

    const headerList = await headers();
    return matchLocale(headerList.get("accept-language")) ?? DEFAULT_LOCALE;
}

/**
 * A `t` bound to the request's locale, for `generateMetadata` and the handful
 * of strings that live in server components.
 */
export async function getServerTranslation() {
    const locale = await getRequestLocale();
    const instance = createI18n(locale);
    return { locale, t: instance.getFixedT(locale) };
}
