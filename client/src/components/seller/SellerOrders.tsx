"use client";

import { Coins, Receipt, ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SellerOrderCard } from "./SellerOrderCard";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard, StatCardGrid } from "@/components/ui/StatCard";
import { useSellerOrders } from "@/features/seller/useSeller";
import { usePageParam } from "@/hooks/usePageParam";
import { useFormat } from "@/i18n/useFormat";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

/**
 * `GET /seller/orders`, rendered.
 *
 * The controller's `$facet` returns the page and its count together, so this
 * pages like every other list in the app. What it does **not** return is any
 * aggregate over the whole history: units and revenue below are summed from the
 * orders on screen, and their hints say so rather than implying lifetime sales
 * the API never sent. Only the order count is a true total.
 *
 * The page lives in its own `?orders=` query parameter so it does not collide
 * with the listings table's `?page=` on the same screen.
 */
export function SellerOrders() {
    const { t } = useTranslation();
    const format = useFormat();
    const { page, setPage } = usePageParam("orders");
    const { data, isPending, isError, error, isFetching, refetch } = useSellerOrders(
        page,
        DEFAULT_PAGE_SIZE,
    );

    const orders = data?.items ?? [];
    const revenue = orders.reduce((sum, order) => sum + order.sellerSubtotal, 0);
    const units = orders.reduce((sum, order) => sum + order.units, 0);

    return (
        <section className="mt-12">
            <div className="mb-6">
                <h2 className="text-xl font-semibold tracking-[-0.02em] text-ink-900">
                    {t("sellerOrders.title")}
                </h2>
                <p className="mt-1 text-sm text-ink-500">{t("sellerOrders.subtitle")}</p>
            </div>

            <StatCardGrid className="mb-6 xl:grid-cols-3">
                <StatCard
                    icon={Receipt}
                    tone="brand"
                    label={t("sellerOrders.statOrders")}
                    value={format.number(data?.total ?? 0)}
                    hint={t("sellerOrders.statOrdersHint")}
                    loading={isPending}
                />
                <StatCard
                    icon={ShoppingBag}
                    tone="teal"
                    label={t("sellerOrders.statUnits")}
                    value={format.number(units)}
                    hint={t("sellerOrders.statUnitsHint")}
                    loading={isPending}
                />
                <StatCard
                    icon={Coins}
                    tone="amber"
                    label={t("sellerOrders.statRevenue")}
                    value={format.price(revenue)}
                    hint={t("sellerOrders.statRevenueHint")}
                    loading={isPending}
                />
            </StatCardGrid>

            {isError ? (
                <ErrorState error={error} onRetry={() => void refetch()} />
            ) : isPending ? (
                <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, index) => (
                        <Skeleton key={index} className="h-52 w-full rounded-xl" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <EmptyState
                    icon={<Receipt className="size-6" />}
                    title={
                        page > 1
                            ? t("sellerOrders.emptyPageTitle")
                            : t("sellerOrders.emptyTitle")
                    }
                    description={
                        page > 1
                            ? t("sellerOrders.emptyPageBody")
                            : t("sellerOrders.emptyBody")
                    }
                    action={
                        page > 1 ? (
                            <Button variant="outline" onClick={() => setPage(1)}>
                                {t("orders.backToFirstPage")}
                            </Button>
                        ) : (
                            <ButtonLink href="/products" variant="outline">
                                {t("sellerOrders.viewCatalog")}
                            </ButtonLink>
                        )
                    }
                />
            ) : (
                <>
                    <p className="mb-5 text-sm text-ink-500">
                        <span className="font-semibold text-ink-900">
                            {t("count.orders", { count: data.total })}
                        </span>{" "}
                        ·{" "}
                        {t("common.pageOf", {
                            page: data.page,
                            pageCount: data.pageCount,
                        })}
                    </p>

                    <div className="space-y-4">
                        {orders.map((order) => (
                            <SellerOrderCard key={order.id} order={order} />
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
            )}
        </section>
    );
}
