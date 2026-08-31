import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import { PageTransition } from "@/components/layout/PageTransition";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { getRequestLocale, getServerTranslation } from "@/i18n/server";
import { APP_NAME } from "@/lib/constants";
import { METADATA_BASE, OG_LOCALES, SITE_URL } from "@/lib/seo";
import { AppProviders } from "@/providers/AppProviders";
import { themeBootstrapScript } from "@/providers/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * The metadata every route inherits.
 *
 * Only the pieces that are genuinely site-wide live here — the brand, the
 * social card, the crawler policy and `metadataBase`. Anything that describes a
 * single page is set by that page, which overrides these by merging over them.
 *
 * There is no `alternates.languages` block, and that is deliberate: all three
 * locales are served from the *same* URL and chosen by cookie or
 * `Accept-Language` (see `i18n/server.ts`). `hreflang` annotations would have to
 * point at per-locale URLs that this app does not have, so declaring them would
 * be pointing crawlers at addresses that do not exist.
 */
export async function generateMetadata(): Promise<Metadata> {
    const { t, locale } = await getServerTranslation();

    const title = `${APP_NAME} — ${t("home.heroBadge")}`;
    const description = t("home.heroLead");

    return {
        // Lets every page below express canonicals and OG images as paths.
        metadataBase: METADATA_BASE,
        title: {
            default: title,
            template: `%s · ${APP_NAME}`,
        },
        description,
        applicationName: APP_NAME,
        alternates: { canonical: "/" },
        openGraph: {
            type: "website",
            siteName: APP_NAME,
            title,
            description,
            url: SITE_URL,
            locale: OG_LOCALES[locale],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                // Lets Google show a full text snippet and a large image preview
                // rather than the truncated default.
                "max-snippet": -1,
                "max-image-preview": "large",
                "max-video-preview": -1,
            },
        },
        // `app/favicon.ico` is picked up automatically; this names the generated
        // card as the Apple touch icon so an iOS bookmark is not a screenshot.
        icons: { apple: "/opengraph-image" },
    };
}

/** Matches the two canvas colours in globals.css, so the browser chrome agrees. */
export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#f5f8f6" },
        { media: "(prefers-color-scheme: dark)", color: "#070c0a" },
    ],
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
    const locale = await getRequestLocale();
    const { t } = await getServerTranslation();

    return (
        <html
            lang={locale}
            suppressHydrationWarning
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <head>
                {/* Resolves the theme before the first paint. Without it the page
                        renders light and snaps to dark once React hydrates. */}
                <script
                    dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
                />
            </head>
            <body className="flex min-h-full flex-col">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-surface focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium focus:text-ink-900 focus:elev-3"
                >
                    {t("nav.skipToContent")}
                </a>

                <AppProviders locale={locale}>
                    {/* The header reads the URL, so it needs a Suspense boundary of its own. */}
                    <Suspense
                        fallback={<div className="h-[var(--header-h)] border-b border-ink-200 bg-surface" />}
                    >
                        <SiteHeader />
                    </Suspense>
                    <main id="main-content" className="flex-1">
                        <PageTransition>{children}</PageTransition>
                    </main>
                    <SiteFooter />
                </AppProviders>
            </body>
        </html>
    );
}
