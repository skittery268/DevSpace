"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { queryKeys } from "@/lib/query-keys";
import { useCartStore } from "@/store/cart.store";

function Outcome({
    tone,
    title,
    description,
    children,
}: {
    tone: "success" | "error";
    title: string;
    description: string;
    children: React.ReactNode;
}) {
    const Icon = tone === "success" ? CheckCircle2 : XCircle;

    return (
        <div className="mx-auto max-w-lg text-center">
            <div
                className={
                    tone === "success"
                        ? "mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success"
                        : "mx-auto flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning"
                }
            >
                <Icon className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink-900">
                {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{description}</p>
            <div className="mt-7">{children}</div>
        </div>
    );
}

export function CheckoutSuccess() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const finishCheckout = useCartStore((state) => state.finishCheckout);
    const checkoutPending = useCartStore((state) => state.checkoutPending);
    const cleared = useRef(false);

    useEffect(() => {
        // Only a cart that actually went through checkout is emptied — this URL is
        // public and could be opened directly.
        if (cleared.current || !checkoutPending) return;
        cleared.current = true;
        finishCheckout();
        // The webhook may already have created the order.
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    }, [checkoutPending, finishCheckout, queryClient]);

    return (
        <Outcome
            tone="success"
            title={t("checkout.successTitle")}
            description={t("checkout.successBody")}
        >
            <Alert tone="info" className="mb-6 text-left">
                {t("checkout.successNote")}
            </Alert>

            <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <ButtonLink href="/orders">{t("checkout.viewOrders")}</ButtonLink>
                <ButtonLink href="/products" variant="outline">
                    {t("checkout.keepShopping")}
                </ButtonLink>
            </div>
        </Outcome>
    );
}

/** The cart is deliberately untouched here so the user can resume where they stopped. */
export function CheckoutCancel() {
    const { t } = useTranslation();

    return (
        <Outcome
            tone="error"
            title={t("checkout.cancelTitle")}
            description={t("checkout.cancelBody")}
        >
            <div className="flex flex-col justify-center gap-2 sm:flex-row">
                <ButtonLink href="/checkout">{t("checkout.tryAgain")}</ButtonLink>
                <ButtonLink href="/cart" variant="outline">
                    {t("checkout.backToCart")}
                </ButtonLink>
            </div>
        </Outcome>
    );
}
