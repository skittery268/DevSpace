"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { OrderStatusBadge } from "./OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardFooter } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Select } from "@/components/ui/Field";
import { useAuth } from "@/features/auth/useAuth";
import { useChangeOrderStatus, useDeleteOrder } from "@/features/orders/useOrders";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useFormat } from "@/i18n/useFormat";
import { orderStatusLabelKey } from "@/lib/constants";
import { canChangeOrderStatus, canDeleteOrder } from "@/lib/permissions";
import { toast } from "@/store/toast.store";
import {
    SETTABLE_ORDER_STATUSES,
    type Order,
    type OrderStatus,
    type SettableOrderStatus,
} from "@/types/order.types";

function isSettableStatus(status: OrderStatus): status is SettableOrderStatus {
    return (SETTABLE_ORDER_STATUSES as readonly string[]).includes(status);
}

export function OrderCard({ order }: { order: Order }) {
    const { t } = useTranslation();
    const format = useFormat();
    const errorMessage = useErrorMessage();
    const { user } = useAuth();
    const deleteOrder = useDeleteOrder();
    const changeStatus = useChangeOrderStatus();
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const mayDelete = canDeleteOrder(user, order);
    const mayChangeStatus = canChangeOrderStatus(user);

    const handleDelete = async () => {
        try {
            await deleteOrder.mutateAsync(order.id);
            toast.success(t("toast.orderDeleted"));
            setConfirmingDelete(false);
        } catch {
            // The dialog shows the mutation error.
        }
    };

    const handleStatusChange = async (status: SettableOrderStatus) => {
        try {
            await changeStatus.mutateAsync({ orderId: order.id, status });
            toast.success(t("toast.statusUpdated"), t(orderStatusLabelKey(status)));
        } catch (error) {
            toast.error(t("toast.statusChangeFailed"), errorMessage(error));
        }
    };

    const itemCount = order.items.reduce((total, item) => total + item.quantity, 0);

    return (
        <Card>
            <CardBody className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
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
                            {format.price(order.totalAmount)}
                        </p>
                        <p className="text-xs text-ink-500">
                            {t("count.items", { count: itemCount })}
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
                                    `getUserOrders` does not populate, so only ids are available —
                                    resolving every title would be one request per line. The link
                                    carries the reader to the product instead; it may since have
                                    been deleted, in which case the page says so.
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
                        <dt className="text-ink-500">{t("orders.shipTo")}</dt>
                        <dd className="min-w-0 truncate font-medium text-ink-900">
                            {order.shipping.fullname}
                        </dd>
                    </div>
                    <div className="flex gap-2">
                        <dt className="text-ink-500">{t("orders.address")}</dt>
                        <dd className="min-w-0 truncate font-medium text-ink-900">
                            {order.shipping.address}, {order.shipping.city},{" "}
                            {order.shipping.country} {order.shipping.zipcode}
                        </dd>
                    </div>
                </dl>
            </CardBody>

            {mayDelete || mayChangeStatus ? (
                <CardFooter className="justify-between">
                    {mayChangeStatus ? (
                        <Select
                            aria-label={t("orders.orderStatus")}
                            // Controlled by the order itself, so a rejected change snaps back
                            // instead of leaving the dropdown showing a status that never took.
                            value={order.status}
                            disabled={changeStatus.isPending}
                            className="h-9 w-auto min-w-44"
                            onChange={(event) =>
                                void handleStatusChange(event.target.value as SettableOrderStatus)
                            }
                        >
                            {/*
                                `refunded` and `partially_refunded` exist on the model but the
                                controller's `allowedStatus` array rejects them, so they can only
                                be shown, never chosen.
                            */}
                            {!isSettableStatus(order.status) ? (
                                <option value={order.status} disabled>
                                    {t("orders.statusLocked", {
                                        status: t(orderStatusLabelKey(order.status)),
                                    })}
                                </option>
                            ) : null}
                            {SETTABLE_ORDER_STATUSES.map((status) => (
                                <option key={status} value={status}>
                                    {t(orderStatusLabelKey(status))}
                                </option>
                            ))}
                        </Select>
                    ) : (
                        <span />
                    )}

                    {mayDelete ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-soft"
                            onClick={() => setConfirmingDelete(true)}
                        >
                            <Trash2 className="size-4" aria-hidden />
                            {t("orders.deleteOrder")}
                        </Button>
                    ) : null}
                </CardFooter>
            ) : null}

            <ConfirmDialog
                open={confirmingDelete}
                title={t("orders.deleteConfirmTitle")}
                description={t("orders.deleteConfirmBody")}
                confirmLabel={t("orders.deleteOrder")}
                loading={deleteOrder.isPending}
                error={deleteOrder.error ? errorMessage(deleteOrder.error) : null}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    deleteOrder.reset();
                    setConfirmingDelete(false);
                }}
            />
        </Card>
    );
}
