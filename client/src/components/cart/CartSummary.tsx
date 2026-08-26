"use client";

import { ArrowRight, Lock, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/Card";
import { useAuth } from "@/features/auth/useAuth";
import { useFormat } from "@/i18n/useFormat";
import { selectItemCount, selectSubtotal, useCartStore } from "@/store/cart.store";

export function CartSummary() {
    const { t } = useTranslation();
    const format = useFormat();
    const subtotal = useCartStore(selectSubtotal);
    const itemCount = useCartStore(selectItemCount);
    const { isAuthenticated } = useAuth();

    return (
        <Card className="lg:sticky lg:top-24">
            <CardHeader title={t("cart.orderSummary")} />

            <CardBody className="space-y-3 text-sm">
                <div className="flex justify-between">
                    <span className="text-ink-500">
                        {t("count.items", { count: itemCount })}
                    </span>
                    <span className="font-medium tabular-nums text-ink-900">
                        {format.price(subtotal)}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-ink-500">{t("cart.shipping")}</span>
                    <span className="text-ink-500">{t("cart.notCharged")}</span>
                </div>

                <div className="flex items-baseline justify-between border-t border-ink-200 pt-3">
                    <span className="text-base font-semibold text-ink-900">
                        {t("cart.estimatedTotal")}
                    </span>
                    <span className="text-xl font-semibold tabular-nums tracking-tight text-ink-900">
                        {format.price(subtotal)}
                    </span>
                </div>

                <p className="flex gap-2 rounded-xl bg-ink-100 p-3 text-xs leading-relaxed text-ink-500">
                    <ShieldCheck className="mt-0.5 size-4 shrink-0 text-link" aria-hidden />
                    <span>{t("cart.priceNote")}</span>
                </p>
            </CardBody>

            <CardFooter className="justify-stretch">
                {isAuthenticated ? (
                    <ButtonLink href="/checkout" fullWidth size="lg">
                        {t("cart.checkout")}
                        <ArrowRight className="size-4" aria-hidden />
                    </ButtonLink>
                ) : (
                    <ButtonLink
                        href="/login?next=%2Fcheckout"
                        fullWidth
                        size="lg"
                        variant="secondary"
                    >
                        <Lock className="size-4" aria-hidden />
                        {t("cart.signInToCheckout")}
                    </ButtonLink>
                )}
            </CardFooter>
        </Card>
    );
}
