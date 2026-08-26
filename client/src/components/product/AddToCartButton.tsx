"use client";

import { Check, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    Button,
    type ButtonSize,
    type ButtonVariant,
} from "@/components/ui/Button";
import { useCartHydrated } from "@/features/cart/useCart";
import { selectQuantityOf, useCartStore } from "@/store/cart.store";
import { toast } from "@/store/toast.store";
import type { Product } from "@/types/product.types";

export function AddToCartButton({
    product,
    quantity = 1,
    size = "md",
    fullWidth = false,
    variant = "primary",
    className,
}: {
    product: Product;
    quantity?: number;
    size?: ButtonSize;
    fullWidth?: boolean;
    /** Cards pass `soft`; the product page keeps the full-strength CTA. */
    variant?: Extract<ButtonVariant, "primary" | "soft">;
    className?: string;
}) {
    const { t } = useTranslation();
    const addItem = useCartStore((state) => state.addItem);
    const inCart = useCartStore(selectQuantityOf(product.id));
    const hydrated = useCartHydrated();
    const [justAdded, setJustAdded] = useState(false);

    useEffect(() => {
        if (!justAdded) return;
        const timeout = window.setTimeout(() => setJustAdded(false), 1600);
        return () => window.clearTimeout(timeout);
    }, [justAdded]);

    const outOfStock = product.stock <= 0;
    const atStockLimit = hydrated && inCart >= product.stock;

    const handleAdd = () => {
        addItem(product, quantity);
        setJustAdded(true);
        toast.success(t("toast.addedToCart"), product.title);
    };

    const label = outOfStock
        ? t("products.outOfStock")
        : atStockLimit
            ? t("products.allStockInCart")
            : justAdded
                ? t("products.added")
                : t("products.addToCart");

    return (
        <Button
            size={size}
            fullWidth={fullWidth}
            onClick={handleAdd}
            disabled={outOfStock || atStockLimit}
            // The confirmation is a colour change rather than a new element, so the
            // button never changes size and the row cannot reflow under the cursor.
            variant={justAdded ? "secondary" : variant}
            className={className}
        >
            {justAdded ? (
                <Check className="size-4 animate-pop" aria-hidden />
            ) : (
                <ShoppingCart className="size-4" aria-hidden />
            )}
            {label}
        </Button>
    );
}
