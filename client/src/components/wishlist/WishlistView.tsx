"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/components/common/States";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductCard";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useWishlistHydrated } from "@/features/wishlist/useWishlist";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/store/toast.store";
import { useWishlistStore } from "@/store/wishlist.store";

export function WishlistView() {
    const { t } = useTranslation();
    const hydrated = useWishlistHydrated();
    const entries = useWishlistStore((state) => state.entries);
    const clear = useWishlistStore((state) => state.clear);
    const addItem = useCartStore((state) => state.addItem);
    const [confirmingClear, setConfirmingClear] = useState(false);

    // The wishlist lives in localStorage, so nothing is known until hydration.
    if (!hydrated) {
        return <ProductGridSkeleton count={4} />;
    }

    if (entries.length === 0) {
        return (
            <EmptyState
                icon={<Heart className="size-6" />}
                title={t("wishlist.emptyTitle")}
                description={t("wishlist.emptyBody")}
                action={
                    <div className="flex flex-wrap justify-center gap-2">
                        <ButtonLink href="/products">
                            {t("wishlist.browseProducts")}
                        </ButtonLink>
                        <ButtonLink href="/categories" variant="outline">
                            {t("wishlist.exploreCategories")}
                        </ButtonLink>
                    </div>
                }
            />
        );
    }

    const inStock = entries.filter((entry) => entry.product.stock > 0);

    const moveAllToCart = () => {
        for (const entry of inStock) addItem(entry.product);
        toast.success(
            t("toast.productsAddedToCart", {
                products: t("count.products", { count: inStock.length }),
            }),
            t("toast.wishlistUnchanged"),
        );
    };

    return (
        <>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 pb-5">
                <p className="text-sm text-ink-500">
                    <span className="text-base font-semibold text-ink-900">
                        {t("wishlist.savedCount", {
                            products: t("count.products", { count: entries.length }),
                        })}
                    </span>
                    {inStock.length !== entries.length ? (
                        <span className="text-ink-400">
                            {" "}
                            ·{" "}
                            {t("wishlist.outOfStockNote", {
                                count: entries.length - inStock.length,
                            })}
                        </span>
                    ) : null}
                </p>

                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={moveAllToCart}
                        disabled={inStock.length === 0}
                    >
                        <ShoppingCart className="size-4" aria-hidden />
                        {t("wishlist.addAllToCart")}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger-soft hover:text-danger"
                        onClick={() => setConfirmingClear(true)}
                    >
                        <Trash2 className="size-4" aria-hidden />
                        {t("wishlist.clearWishlist")}
                    </Button>
                </div>
            </div>

            {/* The saved snapshot is a full product, so the same card renders here as
                    in every other grid — the heart on each one removes it again. */}
            <ProductGrid
                products={entries.map((entry) => entry.product)}
                priorityCount={4}
            />

            <ConfirmDialog
                open={confirmingClear}
                title={t("wishlist.clearConfirmTitle")}
                description={t("wishlist.clearConfirmBody")}
                confirmLabel={t("wishlist.clearWishlist")}
                onConfirm={() => {
                    clear();
                    setConfirmingClear(false);
                    toast.info(t("wishlist.cleared"));
                }}
                onCancel={() => setConfirmingClear(false)}
            />
        </>
    );
}
