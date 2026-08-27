"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Card, CardBody } from "@/components/ui/Card";
import { useFormat } from "@/i18n/useFormat";
import type { SellerOrder } from "@/types/seller.types";

/**
 * One order, seen from the selling side.
 *
 * Read-only by design, and not for want of trying: changing a status is
 * `allowedTo("admin")` and deleting an order is the buyer's alone, so a seller
 * has no write on this resource at all. Offering a control here would only
 * produce a 403.
 *
 * The two money figures are deliberately kept apart. `sellerSubtotal` is summed
 * from the lines the aggregate left in — this seller's own — while `orderTotal`
 * is what the buyer paid across every seller in the basket. Showing only the
 * second would overstate the sale; showing only the first would not reconcile
 * against the buyer's receipt.
 */
export function SellerOrderCard({ order }: { order: SellerOrder }) {
    const { t } = useTranslation();
    const format = useFormat();

    const shared = order.orderTotal > order.sellerSubtotal;

    return (
        <Card>
            <CardBody className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-mono text-sm font-semibold text-ink-900">
                                #{order.id.slice(-8).toUpperCase()}
                            </h3>
                            <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="mt-1 text-xs text-ink-500">
                            {t("orders.placed", { date: format.dateTime(order.createdAt) })}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-lg font-semibold text-ink-900">
                            {format.price(order.sellerSubtotal)}
                        </p>
                        <p className="text-xs text-ink-500">
                            {t("sellerOrders.yourShare")}
                        </p>
                    </div>
                </div>

                <ul className="divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200">
                    {order.items.map((item, index) => (
                        <li
                            key={`${item.productId}-${index}`}
                            className="flex flex-wrap items-center justify-between gap-2 bg-ink-100/50 px-3.5 py-2.5 text-sm"
                        >
                            <div className="min-w-0">
                                {/*
                                    The aggregate does not populate `productId`, so there is no
                                    title to print — the same trade-off the buyer's order card
                                    makes. The link resolves it on the product page instead.
                                */}
                                <Link
                                    href={`/products/${item.productId}`}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-link transition-colors hover:text-link-strong"
                                >
                                    {t("orders.viewProduct")}
                                    <span className="font-mono text-xs text-ink-400">
                                        #{item.productId.slice(-8)}
                                    </span>
                                </Link>
                                <p className="text-xs text-ink-500">
                                    {t("orders.quantity", { count: item.quantity })}
                                </p>
                            </div>
                            <span className="font-medium text-ink-900">
                                {format.price(item.itemTotal)}
                            </span>
                        </li>
                    ))}
                </ul>

                <dl className="grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-500">{t("orders.shipTo")}</dt>
                        <dd className="min-w-0 truncate font-medium text-ink-900">
                            {order.shipping.fullname}
                        </dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-500">{t("orders.address")}</dt>
                        <dd className="min-w-0 truncate font-medium text-ink-900">
                            {order.shipping.address}, {order.shipping.city},{" "}
                            {order.shipping.country} {order.shipping.zipcode}
                        </dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="shrink-0 text-ink-500">{t("sellerOrders.contact")}</dt>
                        <dd className="min-w-0 truncate font-medium text-ink-900">
                            {order.shipping.phone}
                        </dd>
                    </div>
                    {shared ? (
                        <div className="flex gap-2">
                            <dt className="shrink-0 text-ink-500">
                                {t("sellerOrders.orderTotal")}
                            </dt>
                            <dd className="min-w-0 truncate font-medium text-ink-900">
                                {format.price(order.orderTotal)}{" "}
                                <span className="text-xs font-normal text-ink-500">
                                    {t("sellerOrders.allSellers")}
                                </span>
                            </dd>
                        </div>
                    ) : null}
                </dl>
            </CardBody>
        </Card>
    );
}
