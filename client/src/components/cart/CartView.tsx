"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import { EmptyState } from "@/components/common/States";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCartHydrated } from "@/features/cart/useCart";
import { useWishlistCount } from "@/features/wishlist/useWishlist";
import { selectItemCount, useCartStore } from "@/store/cart.store";
import { toast } from "@/store/toast.store";

const LAYOUT = "grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start";

export function CartView() {
    const { t } = useTranslation();
    const hydrated = useCartHydrated();
    const items = useCartStore((state) => state.items);
    const itemCount = useCartStore(selectItemCount);
    const clear = useCartStore((state) => state.clear);
    const wishlistCount = useWishlistCount();
    const [confirmingClear, setConfirmingClear] = useState(false);

    // The cart lives in localStorage, so nothing is known until hydration.
    if (!hydrated) {
        return (
            <div className={LAYOUT}>
                <Skeleton className="h-72 w-full rounded-xl" />
                <Skeleton className="h-60 w-full rounded-xl" />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <EmptyState
                icon={<ShoppingCart className="size-6" />}
                title={t("cart.emptyTitle")}
                description={t("cart.emptyBody")}
                action={
                    <div className="flex flex-wrap justify-center gap-2">
                        <ButtonLink href="/products">{t("cart.browseProducts")}</ButtonLink>
                        {wishlistCount > 0 ? (
                            <ButtonLink href="/wishlist" variant="outline">
                                <Heart className="size-4" aria-hidden />
                                {t("cart.savedProducts", {
                                    products: t("count.products", { count: wishlistCount }),
                                })}
                            </ButtonLink>
                        ) : null}
                    </div>
                }
            />
        );
    }

    return (
        <div className={LAYOUT}>
            <Card>
                <CardHeader
                    title={t("count.items", { count: itemCount })}
                    description={t("cart.inYourCart", {
                        products: t("count.products", { count: items.length }),
                    })}
                    action={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-soft"
                            onClick={() => setConfirmingClear(true)}
                        >
                            <Trash2 className="size-4" aria-hidden />
                            {t("cart.clearCart")}
                        </Button>
                    }
                />
                <CardBody className="py-0">
                    <ul className="stagger">
                        {items.map((item) => (
                            <CartItemRow key={item.productId} item={item} />
                        ))}
                    </ul>
                </CardBody>
            </Card>

            <CartSummary />

            <ConfirmDialog
                open={confirmingClear}
                title={t("cart.clearConfirmTitle")}
                description={t("cart.clearConfirmBody")}
                confirmLabel={t("cart.clearCart")}
                onConfirm={() => {
                    clear();
                    setConfirmingClear(false);
                    toast.info(t("cart.cleared"));
                }}
                onCancel={() => setConfirmingClear(false)}
            />
        </div>
    );
}
