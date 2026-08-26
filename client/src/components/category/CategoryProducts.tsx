"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Container, PageHeader } from "@/components/common/Container";
import { EmptyState, ErrorState } from "@/components/common/States";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductCard";
import { ProductFormDialog } from "@/components/product/ProductFormDialog";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useCategory } from "@/features/categories/useCategories";
import { useProductsByCategory } from "@/features/products/useProducts";
import { usePageParam } from "@/hooks/usePageParam";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { canCreateProduct } from "@/lib/permissions";

export function CategoryProducts({ categoryId }: { categoryId: string }) {
    const { t } = useTranslation();
    const { page, setPage } = usePageParam();
    const { user } = useAuth();
    const [listing, setListing] = useState(false);

    // The API has no single-category endpoint, so the record is looked up in the
    // paginated list. Products load independently and do not wait for it.
    const categoryQuery = useCategory(categoryId);
    const productsQuery = useProductsByCategory(categoryId, page, DEFAULT_PAGE_SIZE);

    const category = categoryQuery.data ?? null;

    return (
        <Container className="py-10">
            <nav
                aria-label={t("common.breadcrumb")}
                className="mb-4 flex items-center gap-1 text-sm text-ink-500"
            >
                <Link href="/categories" className="transition-colors hover:text-link">
                    {t("nav.categories")}
                </Link>
                <ChevronRight className="size-3.5" />
                <span className="truncate text-ink-700">
                    {categoryQuery.isPending
                        ? "…"
                        : (category?.name ?? t("categories.unknownCategory"))}
                </span>
            </nav>

            {categoryQuery.isPending ? (
                <div className="mb-6 space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
            ) : (
                <PageHeader
                    title={category?.name ?? t("categories.title")}
                    description={category?.description ?? t("categories.notFoundBody")}
                    action={
                        canCreateProduct(user) && category ? (
                            <Button onClick={() => setListing(true)}>
                                {t("categories.listProductHere")}
                            </Button>
                        ) : undefined
                    }
                />
            )}

            {category ? (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                    {category.parent ? (
                        <Link href={`/categories/${category.parent.id}`}>
                            <Badge tone="neutral">
                                {t("categories.parentBadge", { name: category.parent.name })}
                            </Badge>
                        </Link>
                    ) : null}
                    {category.allowedAttributes.map((attribute) => (
                        <Badge key={attribute} tone="brand">
                            {attribute}
                        </Badge>
                    ))}
                    {!category.isActive ? (
                        <Badge tone="warning">{t("categories.inactiveBadge")}</Badge>
                    ) : null}
                </div>
            ) : null}

            {productsQuery.isPending ? (
                <ProductGridSkeleton />
            ) : productsQuery.isError ? (
                <ErrorState
                    error={productsQuery.error}
                    onRetry={() => void productsQuery.refetch()}
                />
            ) : productsQuery.data.items.length === 0 ? (
                <EmptyState
                    title={
                        page > 1
                            ? t("categories.emptyPageTitle")
                            : t("categories.noProductsTitle")
                    }
                    description={
                        page > 1
                            ? t("categories.emptyPageBody")
                            : t("categories.noProductsBody")
                    }
                    action={
                        page > 1 ? (
                            <ButtonLink href={`/categories/${categoryId}`}>
                                {t("categories.backToFirstPage")}
                            </ButtonLink>
                        ) : (
                            <ButtonLink href="/products" variant="outline">
                                {t("categories.browseAllProducts")}
                            </ButtonLink>
                        )
                    }
                />
            ) : (
                <>
                    <p className="mb-5 text-sm text-ink-500">
                        <span className="font-semibold text-ink-900">
                            {t("count.products", { count: productsQuery.data.total })}
                        </span>{" "}
                        {t("categories.productsInCategory")}
                    </p>

                    <ProductGrid products={productsQuery.data.items} priorityCount={4} />

                    <Pagination
                        className="mt-10"
                        page={productsQuery.data.page}
                        pageCount={productsQuery.data.pageCount}
                        onPageChange={setPage}
                        disabled={productsQuery.isFetching}
                    />
                </>
            )}

            {listing && category ? (
                <ProductFormDialog
                    open
                    defaultCategoryId={category.id}
                    onClose={() => setListing(false)}
                />
            ) : null}
        </Container>
    );
}
