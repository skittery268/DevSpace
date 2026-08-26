import type { ShippingInfo } from "./order.types";

/** server/models/payment.model.js */

export type PaymentStatus = "pending" | "succeeded" | "failed" | "canceled";

export interface ApiSellerDistribution {
    _id?: string;
    productId: string;
    sellerId: string;
    quantity: number;
    itemTotal: number;
    commission: number;
    sellerAmount: number;
}

export interface ApiPayment {
    _id: string;
    userId: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    stripeCustomerId?: string;
    transferGroup?: string;
    totalAmount: number;
    platformCommission: number;
    sellerNetAmount: number;
    sellerDistributions: ApiSellerDistribution[];
    status: PaymentStatus;
    webhookProcessed: boolean;
    userInfo: ShippingInfo;
    createdAt: string;
    updatedAt: string;
}

/** One line of `userOrder` in the checkout body. */
export interface CheckoutLine {
    id: string;
    quantity: number;
}

export interface CheckoutPayload {
    userOrder: CheckoutLine[];
    userInfo: ShippingInfo;
}

/**
 * `POST /payment/checkout` returns the whole pending Payment document alongside
 * the Stripe session. Only `sessionUrl` matters to the client — the Order is
 * created later, by the Stripe webhook.
 */
export interface CheckoutSession {
    payment: ApiPayment;
    sessionUrl: string;
    sessionId: string;
}
