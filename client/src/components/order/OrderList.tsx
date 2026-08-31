"use client";

import { Receipt } from "lucide-react";
import { Trans, useTranslation } from "react-i18next";

import { OrderCard } from "./OrderCard";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useMyOrders } from "@/features/orders/useOrders";
import { usePageParam } from "@/hooks/usePageParam";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { canChangeOrderStatus } from "@/lib/permissions";

export function OrderList() {
    const { t } = useTranslation();
    const { page, setPage } = usePageParam();
    const { user } = useAuth();
    const { data, isPending, isError, error, isFetching, refetch } = useMyOrders(
        page,
        DEFAULT_PAGE_SIZE,
    );

    if (isPending) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} className="h-48 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (isError) return <ErrorState error={error} onRetry={() => void refetch()} />;

    if (data.items.length === 0) {
        return (
            <EmptyState
                icon={<Receipt className="size-6" />}
                title={page > 1 ? t("orders.emptyPageTitle") : t("orders.emptyTitle")}
                description={
                    page > 1 ? t("orders.emptyPageBody") : t("orders.emptyBody")
                }
                action={
                    page > 1 ? (
                        <ButtonLink href="/orders">
                            {t("orders.backToFirstPage")}
                        </ButtonLink>
                    ) : (
                        <ButtonLink href="/products">
                            {t("orders.browseProducts")}
                        </ButtonLink>
                    )
                }
            />
        );
    }

    return (
        <>
            {canChangeOrderStatus(user) ? (
                <Alert tone="info" className="mb-5" title={t("orders.adminNoteTitle")}>
                    <Trans
                        i18nKey="orders.adminNoteBody"
                        components={[<code key="0" className="font-mono text-xs" />]}
                    />
                </Alert>
            ) : null}

            <p className="mb-5 text-sm text-ink-500">
                <span className="font-semibold text-ink-900">
                    {t("count.orders", { count: data.total })}
                </span>{" "}
                · {t("common.pageOf", { page: data.page, pageCount: data.pageCount })}
            </p>

            <div className="stagger space-y-4">
                {data.items.map((order) => (
                    <OrderCard key={order.id} order={order} />
                ))}
            </div>

            <Pagination
                className="mt-8"
                page={data.page}
                pageCount={data.pageCount}
                onPageChange={setPage}
                disabled={isFetching}
            />
        </>
    );
}
