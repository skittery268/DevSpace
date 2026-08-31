"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { AddToCartButton } from "./AddToCartButton";
import { WishlistIconButton } from "./WishlistButton";
import { RemoteImage } from "@/components/common/RemoteImage";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useFormat } from "@/i18n/useFormat";
import { cn, truncate } from "@/lib/utils";
import type { Product } from "@/types/product.types";

/**
 * The catalog card.
 *
 * Deliberately not a bordered box: the image carries the card, and the text
 * sits directly on the page beneath it. A grid of outlined rectangles is what
 * makes a catalog read as a template, and dropping the frame also lets the
 * photography — the thing a shopper is actually scanning — take the weight.
 *
 * Everything shown here comes from `GET /product` as mapped by `lib/mappers.ts`
 * — there is no list price, no discount and no stored average rating anywhere
 * in the API, so the card shows the review count instead of inventing a star
 * average it cannot back up. The product page computes an average from the
 * reviews it actually loads.
 */
export function ProductCard({
    product,
    priority = false,
}: {
    product: Product;
    /** Set on the first row only: it opts those images out of lazy loading. */
    priority?: boolean;
}) {
    const { t } = useTranslation();
    const format = useFormat();
    const lowStock = product.stock > 0 && product.stock <= 5;
    const soldOut = product.stock <= 0;

    return (
        <article className="group relative flex flex-col">
            <div
                className={cn(
                    "relative aspect-square overflow-hidden rounded-xl bg-ink-100",
                    "ring-1 ring-inset ring-ink-200/80 transition-[box-shadow,transform] duration-300 ease-out",
                    "group-hover:elev-2",
                )}
            >
                <RemoteImage
                    src={product.images[0]}
                    alt={product.title}
                    priority={priority}
                    className={cn(
                        "transition-transform duration-700 ease-out group-hover:scale-[1.04]",
                        soldOut && "opacity-70 saturate-[0.55]",
                    )}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />

                {soldOut ? (
                    <span className="absolute left-2.5 top-2.5">
                        <Badge tone="danger">{t("products.soldOut")}</Badge>
                    </span>
                ) : lowStock ? (
                    <span className="absolute left-2.5 top-2.5">
                        <Badge tone="warning">
                            {t("products.onlyLeft", { count: product.stock })}
                        </Badge>
                    </span>
                ) : null}

                {/* Above the title's stretched link (`before:z-0`), which otherwise
                        covers the whole card and would swallow this click. */}
                <WishlistIconButton
                    product={product}
                    className="absolute right-2.5 top-2.5 z-10"
                />
            </div>

            <div className="flex flex-1 flex-col pt-3.5">
                <div className="flex items-baseline justify-between gap-3">
                    {product.category ? (
                        <Link
                            href={`/categories/${product.category.id}`}
                            className="relative z-10 truncate text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-400 transition-colors hover:text-link"
                        >
                            {product.category.name}
                        </Link>
                    ) : (
                        <span className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-400">
                            {t("common.uncategorized")}
                        </span>
                    )}

                    {product.reviewsCount > 0 ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[0.6875rem] font-medium tabular-nums text-ink-500">
                            <Star className="size-3 fill-star text-star" aria-hidden />
                            {product.reviewsCount}
                            <span className="sr-only">
                                {t("count.reviews", { count: product.reviewsCount })}
                            </span>
                        </span>
                    ) : null}
                </div>

                <h3 className="mt-1.5 text-sm font-medium leading-snug text-ink-900">
                    {/* The stretched link makes the whole card clickable while keeping the
                            category link, the wishlist button and add-to-cart reachable. */}
                    <Link
                        href={`/products/${product.id}`}
                        className="transition-colors before:absolute before:inset-0 before:z-0 before:content-[''] group-hover:text-link"
                    >
                        {truncate(product.title, 56)}
                    </Link>
                </h3>

                {product.seller ? (
                    <p className="mt-1 truncate text-xs text-ink-400">
                        {product.seller.fullname}
                    </p>
                ) : null}

                <p className="mt-2.5 text-[0.9375rem] font-semibold tabular-nums tracking-tight text-ink-900">
                    {format.price(product.price)}
                </p>

                {/* `mt-auto` pins the action to the bottom, so every card in a row lines
                        up however long its title runs. The button stays visible rather than
                        appearing on hover: a control a touch screen can never reveal is not
                        a control. It only *warms* on hover. */}
                <div className="relative z-10 mt-auto pt-3">
                    <AddToCartButton
                        product={product}
                        size="sm"
                        variant="soft"
                        fullWidth
                        className="group-hover:bg-brand-soft-hover"
                    />
                </div>
            </div>
        </article>
    );
}

function ProductCardSkeleton() {
    return (
        <div className="flex flex-col">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-2.5 pt-3.5">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-full rounded-lg" />
            </div>
        </div>
    );
}

const GRID =
    "grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-5 lg:grid-cols-3 lg:gap-x-6 xl:grid-cols-4";

export function ProductGrid({
    products,
    priorityCount = 0,
}: {
    products: Product[];
    /** How many leading images to load eagerly — the above-the-fold row. */
    priorityCount?: number;
}) {
    return (
        // `stagger` is on the grid and not on the skeleton below it: a shimmer
        // that also drifts upward is two loading signals for one wait.
        <div className={cn(GRID, "stagger")}>
            {products.map((product, index) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < priorityCount}
                />
            ))}
        </div>
    );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className={GRID} aria-hidden>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} />
            ))}
        </div>
    );
}
