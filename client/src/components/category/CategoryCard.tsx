"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { RemoteImage } from "@/components/common/RemoteImage";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, truncate } from "@/lib/utils";
import type { Category } from "@/types/category.types";

/**
 * A category tile.
 *
 * The label sits *on* the image rather than in a panel beneath it: a category
 * is a place, and a photograph with its name across the bottom reads as a door
 * into one. It also keeps the tiles the same height whatever the descriptions
 * do, which a text panel never manages.
 */
export function CategoryCard({
    category,
    /** Lets a bento row override the default ratio and fill its own track. */
    className,
    /** Set on the first row: opts that image out of lazy loading. */
    priority = false,
}: {
    category: Category;
    className?: string;
    priority?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <Link
            href={`/categories/${category.id}`}
            className={cn(
                "group relative isolate flex aspect-4/3 flex-col justify-end overflow-hidden rounded-xl bg-ink-200",
                "ring-1 ring-inset ring-ink-200 transition-[box-shadow,transform] duration-300 ease-out",
                "hover:-translate-y-1 hover:elev-2 sm:aspect-16/10",
                className,
            )}
        >
            <RemoteImage
                src={category.imageUrl}
                alt={category.name}
                priority={priority}
                className="-z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Two stops rather than one: the lower half carries the type, the top
                    stays clear so the photograph is still the subject. The mid stop is
                    held high and dark enough that a pale image — a white keyboard, a lit
                    studio — cannot wash the description out. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-scrim/92 from-15% via-scrim/60 via-45% to-transparent"
            />

            <span
                aria-hidden
                className="absolute right-3 top-3 flex size-8 translate-y-1 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-md transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
                <ArrowUpRight className="size-4" />
            </span>

            <div className="relative p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold tracking-tight text-white">
                        {category.name}
                    </h3>
                    {!category.isActive ? (
                        <Badge tone="warning">{t("categories.inactive")}</Badge>
                    ) : null}
                </div>

                {category.parent ? (
                    <p className="mt-0.5 text-xs font-medium text-white/60">
                        {t("categories.inParent", { name: category.parent.name })}
                    </p>
                ) : null}

                <p className="mt-1.5 line-clamp-2 max-w-md text-xs leading-relaxed text-white/75">
                    {truncate(category.description, 120)}
                </p>

                {category.allowedAttributes.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {category.allowedAttributes.slice(0, 3).map((attribute) => (
                            <span
                                key={attribute}
                                className="rounded-md bg-white/12 px-2 py-0.5 text-[0.6875rem] font-medium text-white/90 backdrop-blur-sm"
                            >
                                {attribute}
                            </span>
                        ))}
                        {category.allowedAttributes.length > 3 ? (
                            <span className="rounded-md bg-white/12 px-2 py-0.5 text-[0.6875rem] font-medium text-white/90 backdrop-blur-sm">
                                +{category.allowedAttributes.length - 3}
                            </span>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </Link>
    );
}

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";

export function CategoryGrid({
    categories,
    /** How many leading images to load eagerly — the above-the-fold row. */
    priorityCount = 3,
}: {
    categories: Category[];
    priorityCount?: number;
}) {
    return (
        <div className={cn(GRID, "stagger")}>
            {categories.map((category, index) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    priority={index < priorityCount}
                />
            ))}
        </div>
    );
}

export function CategoryGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className={GRID} aria-hidden>
            {Array.from({ length: count }).map((_, index) => (
                <Skeleton key={index} className="aspect-4/3 w-full rounded-xl sm:aspect-16/10" />
            ))}
        </div>
    );
}
