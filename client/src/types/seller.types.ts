import type { ApiOrderItem, OrderItem, OrderStatus, ShippingInfo } from "./order.types";

/**
 * server/controllers/seller.controller.js
 *
 * `getSellerOrders` is an aggregation, not a `find`, and its `$project` stage
 * is what defines this shape. Two things follow from that:
 *
 *   - `paymentId` is **not** projected, so a seller order carries no link back
 *     to its Payment. `ApiOrder` cannot be reused as-is.
 *   - `products` is `$filter`ed down to the lines whose `sellerId` matches the
 *     caller, while `totalAmount` stays the *whole* order's total across every
 *     seller in it. Those two numbers do not agree, and the UI must not add up
 *     the filtered lines and call the result the order total.
 */
export interface ApiSellerOrder {
    _id: string;
    userId: string;
    userInfo: ShippingInfo;
    products: ApiOrderItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}

/** Flattened view model produced by lib/mappers.ts. */
export interface SellerOrder {
    id: string;
    /** The buyer. Raw id — the aggregate does not populate it. */
    buyerId: string;
    shipping: ShippingInfo;
    /** Only the caller's own lines; the rest were filtered out server-side. */
    items: OrderItem[];
    /** The whole order, every seller included. */
    orderTotal: number;
    /** Summed from `items` — what this order is actually worth to this seller. */
    sellerSubtotal: number;
    /** Units of the caller's products in this order. */
    units: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
}
