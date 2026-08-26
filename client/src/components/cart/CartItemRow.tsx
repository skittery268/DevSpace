"use client";

import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { RemoteImage } from "@/components/common/RemoteImage";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { useIsInWishlist, useSaveForLater } from "@/features/wishlist/useWishlist";
import { useFormat } from "@/i18n/useFormat";
import { cn } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/store/cart.store";

export function CartItemRow({ item }: { item: CartItem }) {
    const { t } = useTranslation();
    const format = useFormat();
    const setQuantity = useCartStore((state) => state.setQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const alreadySaved = useIsInWishlist(item.productId);
    const saveForLater = useSaveForLater();

    // The cached stock is a hint captured when the item was added; the checkout
    // controller is what actually enforces availability.
    const overStock = item.stock > 0 && item.quantity > item.stock;

    return (
        <li className="flex gap-4 border-b border-ink-200 py-5 last:border-b-0">
            <Link
                href={`/products/${item.productId}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-100 transition-transform duration-300 hover:scale-[1.03] sm:size-24"
            >
                <RemoteImage src={item.image} alt={item.title} sizes="96px" />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <Link
                            href={`/products/${item.productId}`}
                            className="line-clamp-2 text-sm font-medium text-ink-900 transition-colors hover:text-link"
                        >
                            {item.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-ink-500">
                            {t("cart.each", { price: format.price(item.price) })}
                        </p>
                    </div>

                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
                        {format.price(item.price * item.quantity)}
                    </span>
                </div>

                {overStock ? (
                    <Badge tone="warning">
                        {t("products.onlyLeftInStock", { count: item.stock })}
                    </Badge>
                ) : null}

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <QuantityStepper
                        value={item.quantity}
                        onChange={(next) => setQuantity(item.productId, next)}
                        max={item.stock > 0 ? item.stock : undefined}
                    />

                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            loading={saveForLater.isPending}
                            onClick={() =>
                                saveForLater.mutate({
                                    productId: item.productId,
                                    title: item.title,
                                })
                            }
                            aria-label={t("cart.moveToWishlist", { title: item.title })}
                        >
                            {saveForLater.isPending ? null : (
                                <Heart
                                    className={cn("size-4", alreadySaved && "fill-current text-danger")}
                                    aria-hidden
                                />
                            )}
                            <span className="hidden sm:inline">{t("cart.saveForLater")}</span>
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-soft"
                            onClick={() => removeItem(item.productId)}
                            aria-label={t("cart.removeFromCart", { title: item.title })}
                        >
                            <Trash2 className="size-4" aria-hidden />
                            <span className="hidden sm:inline">{t("common.remove")}</span>
                        </Button>
                    </div>
                </div>
            </div>
        </li>
    );
}
