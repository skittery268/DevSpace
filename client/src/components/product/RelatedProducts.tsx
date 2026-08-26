"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { ProductGrid, ProductGridSkeleton } from "./ProductCard";
import { SectionHeading } from "@/components/common/States";
import { useProductsByCategory } from "@/features/products/useProducts";
import type { Category } from "@/types/category.types";

/**
 * More from the same category.
 *
 * `GET /product/category/:categoryId` is the only relatedness the API can
 * express — there is no recommendation endpoint and no tag field — so the
 * section is honest about what it is showing. It renders nothing at all when
 * the category holds no other product, rather than an empty shelf.
 */
export function RelatedProducts({
    category,
    excludeProductId,
}: {
    category: Category;
    excludeProductId: string;
}) {
    const { t } = useTranslation();

    // One page is plenty for a shelf, and it reuses the cache the category page
    // already fills.
    const { data, isPending, isError } = useProductsByCategory(category.id, 1, 8);

    const related = (data?.items ?? [])
        .filter((product) => product.id !== excludeProductId)
        .slice(0, 4);

    // A failed side-shelf is not worth an error state on a page that loaded.
    if (isError) return null;
    if (!isPending && related.length === 0) return null;

    return (
        <section className="mt-16">
            <SectionHeading
                eyebrow={t("products.relatedEyebrow")}
                title={t("products.relatedTitle", { category: category.name })}
                action={
                    <Link
                        href={`/categories/${category.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors hover:text-link-strong"
                    >
                        {t("products.seeCategory")}
                        <ArrowRight className="size-4" aria-hidden />
                    </Link>
                }
            />

            {isPending ? (
                <ProductGridSkeleton count={4} />
            ) : (
                <ProductGrid products={related} />
            )}
        </section>
    );
}
