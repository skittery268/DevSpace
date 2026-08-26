import { api, toPageParams } from "./api";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { mapOrder } from "@/lib/mappers";
import { pageCount } from "@/lib/utils";
import type { ApiEnvelope, Paginated, PaginationParams } from "@/types/api.types";
import type { ApiOrder, Order, SettableOrderStatus } from "@/types/order.types";

type OrderListBody = ApiEnvelope<{ orders: ApiOrder[] }> & { orderCount: number };

/**
 * `GET /order` — the caller's own orders only.
 *
 * There is no endpoint that lists someone else's orders, so no seller or admin
 * order queue can exist on the client.
 */
export async function getMyOrders({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
}: PaginationParams = {}): Promise<Paginated<Order>> {
    const { data } = await api.get<OrderListBody>("/order", {
        params: toPageParams(page, limit),
    });

    return {
        items: data.data.orders.map(mapOrder),
        total: data.orderCount,
        page,
        limit,
        pageCount: pageCount(data.orderCount, limit),
    };
}

/** `DELETE /order/:orderId` — buyer only, hard delete. */
export async function deleteOrder(orderId: string): Promise<void> {
    await api.delete(`/order/${orderId}`);
}

/**
 * `PATCH /order/:orderId` — admin only.
 *
 * The controller re-filters the status against a shorter list than the Zod
 * schema, and rejects the single transition `delivered → confirmed`.
 */
export async function changeOrderStatus(
    orderId: string,
    status: SettableOrderStatus,
): Promise<Order> {
    const { data } = await api.patch<ApiEnvelope<{ order: ApiOrder }>>(
        `/order/${orderId}`,
        { status },
    );
    return mapOrder(data.data.order);
}
