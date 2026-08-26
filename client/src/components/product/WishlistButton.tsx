"use client";

import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button, type ButtonSize } from "@/components/ui/Button";
import { useIsInWishlist, useWishlistToggle } from "@/features/wishlist/useWishlist";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

/**
 * The single wishlist affordance.
 *
 * Both variants read the same store, so saving a product anywhere lights it up
 * everywhere it is on screen — the card behind the detail page included — with
 * no refetch and no props to thread through.
 */

function useJustSaved(saved: boolean) {
    const [pulse, setPulse] = useState(false);

    // The pop only plays on the transition into "saved"; removing should feel
    // immediate and unceremonious.
    useEffect(() => {
        if (!pulse) return;
        const timeout = window.setTimeout(() => setPulse(false), 400);
        return () => window.clearTimeout(timeout);
    }, [pulse]);

    return {
        pulse,
        trigger: (nextSaved: boolean) => {
            if (nextSaved && !saved) setPulse(true);
        },
    };
}

/** Floating circular control, for the corner of a product image. */
export function WishlistIconButton({
    product,
    className,
}: {
    product: Product;
    className?: string;
}) {
    const { t } = useTranslation();
    const saved = useIsInWishlist(product.id);
    const toggle = useWishlistToggle();
    const { pulse, trigger } = useJustSaved(saved);

    return (
        <button
            type="button"
            onClick={(event) => {
                // The card is a link; saving must not navigate.
                event.preventDefault();
                event.stopPropagation();
                trigger(toggle(product));
            }}
            aria-pressed={saved}
            aria-label={
                saved
                    ? t("products.removeFromWishlist", { title: product.title })
                    : t("products.saveToWishlist", { title: product.title })
            }
            title={
                saved
                    ? t("products.removeFromWishlistShort")
                    : t("products.saveToWishlistShort")
            }
            className={cn(
                "glass inline-flex size-8.5 items-center justify-center rounded-full border elev-1",
                "transition-[transform,border-color,background-color,color] duration-200 hover:scale-110 active:scale-90",
                saved
                    ? "border-danger-line bg-danger-soft/90 text-danger"
                    : "border-ink-200 text-ink-600 hover:border-danger-line hover:text-danger",
                className,
            )}
        >
            <Heart
                aria-hidden
                className={cn(
                    "size-4 transition-[fill,transform] duration-200",
                    saved ? "fill-current" : "fill-transparent",
                    pulse && "animate-pop",
                )}
            />
        </button>
    );
}

/** Labelled control, for the product page's action row. */
export function WishlistButton({
    product,
    size = "md",
    fullWidth = false,
    className,
}: {
    product: Product;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
}) {
    const { t } = useTranslation();
    const saved = useIsInWishlist(product.id);
    const toggle = useWishlistToggle();
    const { pulse, trigger } = useJustSaved(saved);

    return (
        <Button
            variant="outline"
            size={size}
            fullWidth={fullWidth}
            aria-pressed={saved}
            onClick={() => trigger(toggle(product))}
            className={cn(
                saved && "border-danger-line bg-danger-soft text-danger hover:border-danger hover:bg-danger-soft hover:text-danger",
                className,
            )}
        >
            <Heart
                aria-hidden
                className={cn(
                    "size-4 transition-[fill] duration-200",
                    saved ? "fill-current" : "fill-transparent",
                    pulse && "animate-pop",
                )}
            />
            {saved ? t("products.saved") : t("products.save")}
        </Button>
    );
}
