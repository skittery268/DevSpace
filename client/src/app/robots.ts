import type { MetadataRoute } from "next";

import { absoluteUrl, SITE_URL } from "@/lib/seo";

/**
 * Crawler policy.
 *
 * The disallow list is the set of routes that either need a session or exist
 * only as a step inside a flow — never a whole section of the storefront. The
 * catalog (`/products`, `/categories` and everything under them) stays fully
 * open, because that is the content worth indexing.
 *
 * These paths are `noindex` in their own metadata as well. The two are not
 * redundant: `noindex` is what removes a URL that is already in the index,
 * while a `Disallow` stops the crawl before it happens. A page listed here is
 * one a crawler should not spend a request on either way.
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    // Staff consoles.
                    "/admin",
                    "/seller",
                    // Requires a session; every /search endpoint is behind `protect`.
                    "/search",
                    // Personal state, identical shell for every visitor.
                    "/cart",
                    "/checkout",
                    "/orders",
                    "/profile",
                    "/wishlist",
                    // Account flows, several of which carry single-use tokens.
                    "/login",
                    "/register",
                    "/forgot-password",
                    "/reset-password",
                    "/two-factor",
                    // Stripe's return targets — a receipt screen, not a page.
                    "/success",
                    "/cancel",
                ],
            },
        ],
        sitemap: absoluteUrl("/sitemap.xml"),
        host: SITE_URL,
    };
}
