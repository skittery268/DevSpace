import {
    ArrowRight,
    PackageCheck,
    ShieldCheck,
    Sparkles,
    Store,
} from "lucide-react";
import { Suspense } from "react";

import { HomeTwoFactorRedirect } from "@/components/home/HomeTwoFactorRedirect";
import {
    CatalogStats,
    FeaturedCategories,
    HeroCollage,
    HeroTitle,
    LatestProducts,
    MostReviewedProducts,
} from "@/components/home/HomeSections";
import { Container } from "@/components/common/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getServerTranslation } from "@/i18n/server";
import { APP_NAME } from "@/lib/constants";
import { INTL_LOCALES } from "@/i18n/config";
import {
    jsonLdGraph,
    organizationSchema,
    websiteSchema,
} from "@/lib/structured-data";

/**
 * Three claims the API can actually back. They run as a hairline-divided band
 * rather than three more cards — the page already has enough boxes, and a
 * one-line band is what a reader of a premium storefront expects here.
 */
const HIGHLIGHTS = [
    {
        icon: Store,
        titleKey: "home.highlightSellersTitle",
        bodyKey: "home.highlightSellersBody",
    },
    {
        icon: ShieldCheck,
        titleKey: "home.highlightAccountsTitle",
        bodyKey: "home.highlightAccountsBody",
    },
    {
        icon: PackageCheck,
        titleKey: "home.highlightCheckoutTitle",
        bodyKey: "home.highlightCheckoutBody",
    },
] as const;

/**
 * The marketing copy stays server-rendered — it is the one page a search engine
 * reads — so it is translated with the request-scoped `t` rather than the
 * client hook. Switching language calls `router.refresh()`, which re-renders
 * this tree in the new language without a reload.
 */
export default async function HomePage() {
    const { t, locale } = await getServerTranslation();

    return (
        <>
            {/*
                The site-level graph, declared once on the page that represents
                the site. No `potentialAction` sitelinks search box: every
                `/search` endpoint sits behind `protect`, so the URL template
                would answer 401 for exactly the visitors a search box is for.
            */}
            <JsonLd
                data={jsonLdGraph(
                    organizationSchema(t("home.heroLead")),
                    websiteSchema(t("home.heroLead"), INTL_LOCALES[locale]),
                )}
            />

            {/* Google's callback bounces 2FA users back to "/" with a query flag. */}
            <Suspense fallback={null}>
                <HomeTwoFactorRedirect />
            </Suspense>

            {/*
                The hero is asymmetric on purpose: the type column is wider than the
                image column and the two are not vertically centred against each other.
                A 50/50 split with a picture floated opposite the headline is the exact
                shape every starter template ships with.
            */}
            <section className="relative isolate overflow-hidden bg-surface">
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-grid" />
                <div
                    aria-hidden
                    className="animate-float pointer-events-none absolute -left-40 -top-56 -z-10 size-[38rem] rounded-full bg-brand-400/14 blur-3xl"
                />

                <Container className="py-16 lg:py-24">
                    <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
                        <div className="lg:col-span-7 xl:col-span-6">
                            <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-soft px-3 py-1.5 text-xs font-medium text-link">
                                <Sparkles className="size-3.5" aria-hidden />
                                {t("home.heroBadge")}
                            </span>

                            <HeroTitle app={APP_NAME} />

                            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-600 sm:text-lg">
                                {t("home.heroLead")}
                            </p>

                            {/* Full width while they are stacked, so neither reads as the
                                    lesser option purely because its label is shorter. */}
                            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <ButtonLink
                                    href="/products"
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    {t("home.browseProducts")}
                                    <ArrowRight className="size-4" aria-hidden />
                                </ButtonLink>
                                <ButtonLink
                                    href="/categories"
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    {t("home.exploreCategories")}
                                </ButtonLink>
                            </div>

                            <CatalogStats />
                        </div>

                        <div className="lg:col-span-5 xl:col-span-6 xl:pl-10">
                            <HeroCollage />
                        </div>
                    </div>
                </Container>
            </section>

            <div aria-hidden className="h-px rule-fade" />

            <section className="bg-surface">
                <Container>
                    <Reveal>
                        <ul className="grid grid-cols-1 divide-y divide-ink-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                            {HIGHLIGHTS.map(({ icon: Icon, titleKey, bodyKey }, index) => (
                                <li key={titleKey} className={cnHighlight(index)}>
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-link ring-1 ring-inset ring-brand-line/60">
                                        <Icon className="size-4.5" aria-hidden />
                                    </div>
                                    <h2 className="mt-4 text-sm font-semibold text-ink-900">
                                        {t(titleKey)}
                                    </h2>
                                    <p className="mt-1.5 text-sm leading-relaxed text-ink-500">
                                        {t(bodyKey)}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </Reveal>
                </Container>
            </section>

            <div aria-hidden className="h-px rule-fade" />

            <Container className="py-16 sm:py-20">
                <Reveal>
                    <LatestProducts />
                </Reveal>
            </Container>

            <section className="border-y border-ink-200 bg-surface">
                <Container className="py-16 sm:py-20">
                    <Reveal>
                        <FeaturedCategories />
                    </Reveal>
                </Container>
            </section>

            <Container className="py-16 sm:py-20">
                <Reveal>
                    <MostReviewedProducts />
                </Reveal>
            </Container>

            {/*
                A dark emerald closer. Every section above it sits on white or the page
                canvas, so ending on an inked panel gives the page a floor instead of
                letting it fade out.
            */}
            <Container className="pb-20">
                <Reveal>
                    <div className="relative isolate overflow-hidden rounded-2xl bg-ink-900 px-6 py-16 text-center sm:px-12 sm:py-20">
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 -z-10 bg-brand-gradient opacity-[0.22]"
                        />
                        <div
                            aria-hidden
                            className="animate-float pointer-events-none absolute -right-24 -top-24 -z-10 size-96 rounded-full bg-accent-400/20 blur-3xl"
                        />

                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-200">
                            {t("home.ctaEyebrow")}
                        </p>
                        <h2 className="mx-auto mt-4 max-w-2xl text-[clamp(1.75rem,1.35rem+2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-white">
                            {t("home.ctaTitle")}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
                            {t("home.ctaBody")}
                        </p>
                        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                            <ButtonLink
                                href="/register"
                                size="lg"
                                className="w-full bg-white text-ink-900 shadow-none hover:bg-white/90 active:bg-white/80 sm:w-auto"
                            >
                                {t("home.ctaPrimary")}
                                <ArrowRight className="size-4" aria-hidden />
                            </ButtonLink>
                            <ButtonLink
                                href="/products"
                                size="lg"
                                variant="outline"
                                className="w-full border-white/25 bg-transparent text-white hover:border-white/40 hover:bg-white/10 hover:text-white sm:w-auto"
                            >
                                {t("home.ctaSecondary")}
                            </ButtonLink>
                        </div>
                    </div>
                </Reveal>
            </Container>
        </>
    );
}

/** Padding differs per column so the divided band breathes evenly at its edges. */
function cnHighlight(index: number) {
    return [
        "py-10 sm:py-12",
        index === 0 ? "sm:pr-8" : index === 1 ? "sm:px-8" : "sm:pl-8",
    ].join(" ");
}
