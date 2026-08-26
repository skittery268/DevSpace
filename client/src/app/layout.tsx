import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";

import "./globals.css";
import { PageTransition } from "@/components/layout/PageTransition";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteChrome";
import { getRequestLocale, getServerTranslation } from "@/i18n/server";
import { APP_NAME } from "@/lib/constants";
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

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();

    return {
        title: {
            default: `${APP_NAME} — ${t("home.heroBadge")}`,
            template: `%s · ${APP_NAME}`,
        },
        description: t("home.heroLead"),
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
                        fallback={<div className="h-17 border-b border-ink-200 bg-surface" />}
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
