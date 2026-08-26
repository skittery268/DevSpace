"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { createCheckoutSession } from "@/services/payment.service";
import { useCartStore } from "@/store/cart.store";
import type { CheckoutPayload, CheckoutSession } from "@/types/payment.types";

/**
 * Starts the hosted Stripe Checkout flow.
 *
 * The backend owns the entire purchase: it prices the order from the database,
 * creates the session and a `pending` Payment, and only its webhook turns that
 * into an Order. The client's part is to hand over ids and quantities and then
 * hand the browser to Stripe.
 *
 * The cart is *not* emptied here — the user may cancel on Stripe's page and
 * come back. `/success` is what clears it.
 */
export function useCheckout() {
    const markCheckoutStarted = useCartStore((state) => state.markCheckoutStarted);

    return useMutation<CheckoutSession, ApiError, CheckoutPayload>({
        mutationFn: createCheckoutSession,
        onSuccess: (session) => {
            markCheckoutStarted();
            window.location.assign(session.sessionUrl);
        },
    });
}
