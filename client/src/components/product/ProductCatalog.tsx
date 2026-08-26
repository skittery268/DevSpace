"use client";

import { PackageSearch } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ProductGrid, ProductGridSkeleton } from "./ProductCard";
import { EmptyState, ErrorState } from "@/components/common/States";
import { ButtonLink } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useProducts } from "@/features/products/useProducts";
import { usePageParam } from "@/hooks/usePageParam";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The catalog is paginated server-side. There is no sort or filter parameter on
 * `GET /product` — the controller hardcodes `{ createdAt: -1 }` — so the list
 * order is always newest first.
 */
export function ProductCatalog() {
    const { t } = useTranslation();
    const { page, setPage } = usePageParam();
    const { data, isPending, isError, error, isFetching, refetch } = useProducts(
        page,
        DEFAULT_PAGE_SIZE,
    );

    if (isPending) return <ProductGridSkeleton />;

    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

    if (data.items.length === 0) {
        return (
            <EmptyState
                icon={<PackageSearch className="size-6" />}
                title={
                    page > 1 ? t("products.emptyPageTitle") : t("products.emptyTitle")
                }
                description={
                    page > 1 ? t("products.emptyPageBody") : t("products.emptyBody")
                }
                action={
                    page > 1 ? (
                        <ButtonLink href="/products">
                            {t("products.backToFirstPage")}
                        </ButtonLink>
                    ) : undefined
                }
            />
        );
    }

    return (
        <>
            <p className="mb-5 text-sm text-ink-500">
                <span className="font-semibold text-ink-900">
                    {t("count.products", { count: data.total })}
                </span>{" "}
                · {t("common.pageOf", { page: data.page, pageCount: data.pageCount })}
            </p>

            {/* The grid dims rather than unmounts while the next page loads, so the
                    page never collapses to an empty column under the cursor. */}
            <div
                className={cn(
                    "transition-opacity duration-200",
                    isFetching && "pointer-events-none opacity-60",
                )}
            >
                <ProductGrid products={data.items} priorityCount={4} />
            </div>

            <Pagination
                className="mt-10"
                page={data.page}
                pageCount={data.pageCount}
                onPageChange={setPage}
                disabled={isFetching}
            />
        </>
    );
}
