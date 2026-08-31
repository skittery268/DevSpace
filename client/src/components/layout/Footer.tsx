"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { LanguageSegmentedControl } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeSegmentedControl } from "./ThemeToggle";
import { Container } from "@/components/common/Container";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/** Keys, not words — the labels are resolved at render time. */
const SECTIONS = [
    {
        titleKey: "footer.shop",
        links: [
            { href: "/products", labelKey: "footer.allProducts" },
            { href: "/categories", labelKey: "footer.categories" },
            { href: "/cart", labelKey: "footer.cart" },
            { href: "/wishlist", labelKey: "footer.wishlist" },
        ],
    },
    {
        titleKey: "footer.account",
        links: [
            { href: "/profile", labelKey: "footer.yourAccount" },
            { href: "/orders", labelKey: "footer.orders" },
            { href: "/login", labelKey: "footer.signIn" },
            { href: "/register", labelKey: "footer.createAccount" },
        ],
    },
] as const;

export function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="relative mt-auto overflow-hidden border-t border-ink-200 bg-surface">
            {/* Hairline of brand colour along the seam, instead of a heavy band. */}
            <div aria-hidden className="h-px w-full bg-brand-gradient opacity-70" />

            <Container className="py-12">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <Logo />
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-500">
                            {t("footer.blurb", { tagline: APP_TAGLINE })}
                        </p>
                        {/* `minmax(0,…)` on the track: the theme control is the widest
                                thing in the footer and would otherwise set the column's
                                min-content width for the whole grid. */}
                        <div className="mt-6 grid max-w-md grid-cols-1 gap-x-10 gap-y-5 min-[420px]:grid-cols-[minmax(0,auto)_minmax(0,auto)]">
                            <div className="min-w-0">
                                <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
                                    {t("language.label")}
                                </p>
                                <LanguageSegmentedControl className="flex w-full" />
                            </div>
                            <div className="min-w-0">
                                <p className="mb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
                                    {t("theme.label")}
                                </p>
                                <ThemeSegmentedControl className="flex w-full" />
                            </div>
                        </div>
                    </div>

                    {SECTIONS.map((section) => (
                        <nav key={section.titleKey} aria-label={t(section.titleKey)}>
                            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
                                {t(section.titleKey)}
                            </h3>
                            <ul className="mt-2 sm:mt-4 sm:space-y-2.5">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="inline-flex min-h-11 items-center text-sm text-ink-500 transition-[color,transform] duration-200 hover:translate-x-0.5 hover:text-link sm:min-h-0"
                                        >
                                            {t(link.labelKey)}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="mt-12 flex flex-col gap-2 border-t border-ink-200 pt-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>
                        {t("footer.rights", {
                            year: new Date().getFullYear(),
                            app: APP_NAME,
                        })}
                    </p>
                    <p>{t("footer.stripeNote")}</p>
                </div>
            </Container>
        </footer>
    );
}
