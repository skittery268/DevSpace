/** server/models/order.model.js */

/** Shipping snapshot, duplicated verbatim on Order and Payment. */
export interface ShippingInfo {
    fullname: string;
    email: string;
    city: string;
    country: string;
    address: string;
    phone: string;
    zipcode: string;
}

/**
 * Every status declared on the model. `refunded` and `partially_refunded` pass
 * the Zod schema but are rejected by the `allowedStatus` array inside
 * `order.controller.changeStatus`, so they are unreachable through the API.
 */
export const ORDER_STATUSES = [
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "canceled",
    "refunded",
    "partially_refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** The subset `changeStatus` actually accepts (order.controller.js:10). */
export const SETTABLE_ORDER_STATUSES = [
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "completed",
    "canceled",
] as const;

export type SettableOrderStatus = (typeof SETTABLE_ORDER_STATUSES)[number];

export interface ApiOrderItem {
    _id?: string;
    /** Raw ObjectId — `getUserOrders` uses `.lean()` and never populates. */
    productId: string;
    sellerId: string;
    quantity: number;
    itemTotal: number;
}

export interface ApiOrder {
    _id: string;
    userId: string;
    userInfo: ShippingInfo;
    products: ApiOrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentId: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    productId: string;
    sellerId: string;
    quantity: number;
    itemTotal: number;
}

export interface Order {
    id: string;
    userId: string;
    shipping: ShippingInfo;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentId: string;
    createdAt: string;
    updatedAt: string;
}
