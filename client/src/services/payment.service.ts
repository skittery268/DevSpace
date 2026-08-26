import { api } from "./api";

import type { ApiEnvelope } from "@/types/api.types";
import type { CheckoutPayload, CheckoutSession } from "@/types/payment.types";

/**
 * `POST /payment/checkout` — signed in and not banned.
 *
 * The server recomputes every price from the database, checks stock, creates a
 * Stripe Checkout session and a `pending` Payment, then returns the hosted
 * session URL. Nothing else about the purchase happens here: the Order is
 * created later by `POST /payment/webhook`, which Stripe calls directly.
 *
 * There is no client-side Stripe integration and no PaymentIntent to create.
 */
export async function createCheckoutSession(
    payload: CheckoutPayload,
): Promise<CheckoutSession> {
    const { data } = await api.post<ApiEnvelope<CheckoutSession>>(
        "/payment/checkout",
        payload,
    );
    return data.data;
}
