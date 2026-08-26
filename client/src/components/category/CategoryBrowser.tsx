"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CategoryGrid, CategoryGridSkeleton } from "./CategoryCard";
import { CategoryFormDialog } from "./CategoryFormDialog";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/features/auth/useAuth";
import { useCategories } from "@/features/categories/useCategories";
import { usePageParam } from "@/hooks/usePageParam";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { canManageCategories } from "@/lib/permissions";
import { cn } from "@/lib/utils";

export function CategoryBrowser() {
    const { t } = useTranslation();
    const { page, setPage } = usePageParam();
    const { user } = useAuth();
    const [creating, setCreating] = useState(false);
    const { data, isPending, isError, error, isFetching, refetch } = useCategories(
        page,
        DEFAULT_PAGE_SIZE,
    );

    if (isPending) return <CategoryGridSkeleton />;

    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

    if (data.items.length === 0) {
        return (
            <>
                <EmptyState
                    title={
                        page > 1
                            ? t("categories.emptyPageTitle")
                            : t("categories.emptyTitle")
                    }
                    description={
                        page > 1 ? t("categories.emptyPageBody") : t("categories.emptyBody")
                    }
                    action={
                        canManageCategories(user) ? (
                            <Button onClick={() => setCreating(true)}>
                                {t("categories.createOne")}
                            </Button>
                        ) : page > 1 ? (
                            <ButtonLink href="/categories">
                                {t("categories.backToFirstPage")}
                            </ButtonLink>
                        ) : undefined
                    }
                />

                {creating ? (
                    <CategoryFormDialog open onClose={() => setCreating(false)} />
                ) : null}
            </>
        );
    }

    return (
        <>
            <p className="mb-5 text-sm text-ink-500">
                <span className="font-semibold text-ink-900">
                    {t("count.categories", { count: data.total })}
                </span>{" "}
                · {t("common.pageOf", { page: data.page, pageCount: data.pageCount })}
            </p>

            <div
                className={cn(
                    "transition-opacity duration-200",
                    isFetching && "pointer-events-none opacity-60",
                )}
            >
                <CategoryGrid categories={data.items} />
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
