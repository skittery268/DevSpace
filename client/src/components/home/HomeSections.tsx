"use client";

import { ArrowRight, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import { Trans, useTranslation } from "react-i18next";

import {
    CategoryCard,
    CategoryGridSkeleton,
} from "@/components/category/CategoryCard";
import { RemoteImage } from "@/components/common/RemoteImage";
import { EmptyState, ErrorState, SectionHeading } from "@/components/common/States";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCategories } from "@/features/categories/useCategories";
import { useProducts } from "@/features/products/useProducts";
import { useFormat } from "@/i18n/useFormat";
import { cn } from "@/lib/utils";

/**
 * The home page shelves.
 *
 * Every section here requests the *same* page of `GET /product`, so TanStack
 * Query serves all of them from one cache entry and one network request — the
 * hero collage included. The catalog endpoint hardcodes `{ createdAt: -1 }`
 * and has no sort parameter, so "most reviewed" is derived from that page's
 * `reviewsCount`, and the copy says so rather than implying a global ranking.
 */
const HOME_PAGE_SIZE = 12;

/**
 * The hero headline, as a client island.
 *
 * The rest of the hero is server-rendered for SEO, but this one line wraps the
 * product name in a gradient span *inside* the sentence — and where that name
 * falls differs per language ("on DevSpace" / "на DevSpace" / "DevSpace-ზე"),
 * so it has to be markup inside the translation rather than concatenation.
 */
export function HeroTitle({ app }: { app: string }) {
    return (
        // One fluid size instead of `text-4xl sm:text-5xl lg:text-6xl
        // xl:text-display` — that ladder snapped at three breakpoints and, at
        // 3.25rem, actually shrank the headline again above 1280px.
        <h1 className="text-display mt-7 wrap-anywhere text-ink-900">
            <Trans
                i18nKey="home.heroTitle"
                values={{ app }}
                components={[<span key="0" className="text-brand-gradient" />]}
            />
        </h1>
    );
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors hover:text-link-strong"
        >
            {children}
            <ArrowRight
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden
            />
        </Link>
    );
}

/**
 * The hero's right-hand side: a staggered wall of real catalog photography.
 *
 * A stock illustration next to the headline is the single most template-like
 * thing a marketplace home page can do. These are the actual newest listings,
 * they link where they look like they should, and the column offsets keep the
 * arrangement from reading as another even grid.
 */
export function HeroCollage() {
    const { t } = useTranslation();
    const format = useFormat();
    const { data, isPending } = useProducts(1, HOME_PAGE_SIZE);

    const picks = (data?.items ?? []).filter((product) => product.images[0]).slice(0, 5);

    // Nothing to show is a real state on a fresh install — the hero simply runs
    // as a single column rather than holding space for an empty frame.
    if (!isPending && picks.length < 3) return null;

    const columns = [
        { items: picks.slice(0, 2), offset: "sm:pt-12", ratios: ["aspect-4/5", "aspect-square"] },
        { items: picks.slice(2, 4), offset: "", ratios: ["aspect-square", "aspect-4/5"] },
    ];

    return (
        <div className="relative" aria-label={t("home.newestListings")}>
            {/* Emerald bloom behind the wall, so the tiles sit in light rather than
                    on a flat panel. */}
            <div
                aria-hidden
                className="animate-float pointer-events-none absolute -inset-8 -z-10 rounded-full bg-brand-400/18 blur-3xl"
            />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {columns.map((column, columnIndex) => (
                    <div key={columnIndex} className={cn("flex flex-col gap-3 sm:gap-4", column.offset)}>
                        {isPending
                            ? column.ratios.map((ratio, index) => (
                                    <Skeleton key={index} className={cn("w-full rounded-xl", ratio)} />
                                ))
                            : column.items.map((product, index) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className={cn(
                                            "group relative isolate block overflow-hidden rounded-xl bg-ink-100 ring-1 ring-inset ring-ink-200",
                                            "elev-2 transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1 hover:elev-3",
                                            column.ratios[index],
                                        )}
                                    >
                                        <RemoteImage
                                            src={product.images[0]}
                                            alt={product.title}
                                            priority={columnIndex === 0 && index === 0}
                                            sizes="(max-width: 640px) 45vw, 22vw"
                                            className="-z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                        <div
                                            aria-hidden
                                            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-scrim/80 via-transparent to-transparent"
                                        />
                                        <div className="absolute inset-x-0 bottom-0 p-3">
                                            <p className="truncate text-xs font-medium text-white">
                                                {product.title}
                                            </p>
                                            <p className="text-xs font-semibold tabular-nums text-white/80">
                                                {format.price(product.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Catalog size, straight from the two list endpoints' count fields. */
export function CatalogStats() {
    const { t } = useTranslation();
    const format = useFormat();
    const products = useProducts(1, HOME_PAGE_SIZE);
    const categories = useCategories(1, 6);

    const stats = [
        { label: t("home.statProducts"), value: products.data?.total },
        { label: t("home.statCategories"), value: categories.data?.total },
        // Stripe is a product name, so it is never translated.
        { label: t("home.statCheckout"), value: "Stripe" as const },
    ];

    return (
        <dl className="mt-10 flex flex-wrap items-end gap-x-10 gap-y-5 sm:gap-x-12">
            {stats.map(({ label, value }) => (
                <div key={label} className="relative">
                    <dd className="text-3xl font-semibold tracking-[-0.03em] tabular-nums text-ink-900">
                        {value === undefined ? (
                            <Skeleton className="h-8 w-16" />
                        ) : typeof value === "number" ? (
                            format.number(value)
                        ) : (
                            value
                        )}
                    </dd>
                    <dt className="mt-1 text-xs font-medium uppercase tracking-[0.1em] text-ink-500">
                        {label}
                    </dt>
                </div>
            ))}
        </dl>
    );
}

export function LatestProducts() {
    const { t } = useTranslation();
    const { data, isPending, isError, error, refetch } = useProducts(1, HOME_PAGE_SIZE);

    return (
        <section>
            <SectionHeading
                eyebrow={t("home.justListed")}
                title={t("home.newArrivals")}
                description={t("home.newArrivalsBody")}
                action={
                    <SectionLink href="/products">
                        {t("home.seeAllProducts")}
                    </SectionLink>
                }
            />

            {isPending ? (
                <ProductGridSkeleton count={8} />
            ) : isError ? (
                <ErrorState error={error} onRetry={() => void refetch()} />
            ) : data.items.length === 0 ? (
                <EmptyState
                    icon={<Sparkles className="size-6" />}
                    title={t("home.noProductsTitle")}
                    description={t("home.noProductsBody")}
                />
            ) : (
                <ProductGrid products={data.items.slice(0, 8)} priorityCount={4} />
            )}
        </section>
    );
}

/** Reuses the same cached page as `LatestProducts` — no second request. */
export function MostReviewedProducts() {
    const { t } = useTranslation();
    const { data, isPending, isError } = useProducts(1, HOME_PAGE_SIZE);

    const ranked = (data?.items ?? [])
        .filter((product) => product.reviewsCount > 0)
        .sort((a, b) => b.reviewsCount - a.reviewsCount)
        .slice(0, 4);

    // A shelf that would be empty or broken is simply not rendered: the page
    // above it is already complete.
    if (isError) return null;
    if (!isPending && ranked.length === 0) return null;

    return (
        <section>
            <SectionHeading
                eyebrow={t("home.talkedAbout")}
                title={t("home.mostReviewed")}
                description={
                    data
                        ? t("home.mostReviewedBody", { count: data.items.length })
                        : undefined
                }
                action={
                    <SectionLink href="/products">
                        {t("home.browseCatalog")}
                    </SectionLink>
                }
            />

            {isPending ? (
                <ProductGridSkeleton count={4} />
            ) : (
                <ProductGrid products={ranked} />
            )}
        </section>
    );
}

/**
 * Categories, laid out as a bento rather than an even grid: the first one runs
 * double width on a wide screen. Six identical rectangles is the shape every
 * template ships with, and the asymmetry costs nothing but a column span.
 */
export function FeaturedCategories() {
    const { t } = useTranslation();
    const { data, isPending, isError, error, refetch } = useCategories(1, 5);

    return (
        <section>
            <SectionHeading
                eyebrow={t("home.browse")}
                title={t("home.shopByCategory")}
                description={t("home.shopByCategoryBody")}
                action={
                    <SectionLink href="/categories">
                        {t("home.seeAllCategories")}
                    </SectionLink>
                }
            />

            {isPending ? (
                <CategoryGridSkeleton count={5} />
            ) : isError ? (
                <ErrorState error={error} onRetry={() => void refetch()} />
            ) : data.items.length === 0 ? (
                <EmptyState
                    icon={<Star className="size-6" />}
                    title={t("home.noCategoriesTitle")}
                    description={t("home.noCategoriesBody")}
                />
            ) : (
                // Five tiles on a three-column track: the first runs double width, so
                // row one is wide+narrow and row two is three across — a shape that
                // fills exactly, with none of the ragged holes a bento usually leaves.
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:auto-rows-[12rem] sm:gap-5 lg:grid-cols-3 lg:auto-rows-[13.5rem]">
                    {data.items.map((category, index) => (
                        <div
                            key={category.id}
                            className={cn(
                                index === 0 && data.items.length >= 3 && "sm:col-span-2",
                            )}
                        >
                            <CategoryCard
                                category={category}
                                priority={index < 3}
                                className="sm:aspect-auto sm:h-full"
                            />
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
