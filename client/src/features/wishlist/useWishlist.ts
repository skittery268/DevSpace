"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { ApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import { getProduct } from "@/services/product.service";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/store/toast.store";
import {
    selectIsInWishlist,
    selectWishlistCount,
    useWishlistStore,
} from "@/store/wishlist.store";
import type { Product } from "@/types/product.types";

/**
 * The read/write surface every wishlist affordance shares.
 *
 * Because all of them read the one zustand store, saving a product on its
 * detail page immediately lights up its card in every grid that is mounted,
 * and the header count moves with it — no refetch, no prop drilling.
 */

export function useWishlistHydrated(): boolean {
    return useStoreHydrated(useWishlistStore);
}

export function useWishlistCount(): number {
    const hydrated = useWishlistHydrated();
    const count = useWishlistStore(selectWishlistCount);
    return hydrated ? count : 0;
}

/** `false` until localStorage has been read, so SSR and hydration agree. */
export function useIsInWishlist(productId: string): boolean {
    const hydrated = useWishlistHydrated();
    const saved = useWishlistStore(selectIsInWishlist(productId));
    return hydrated && saved;
}

/** Toggles a product and announces the result. */
export function useWishlistToggle() {
    const { t } = useTranslation();
    const toggle = useWishlistStore((state) => state.toggle);

    return useCallback(
        (product: Product) => {
            const saved = toggle(product);
            if (saved) {
                toast.success(t("toast.savedToWishlist"), product.title);
            } else {
                toast.info(t("toast.removedFromWishlist"), product.title);
            }
            return saved;
        },
        [toggle, t],
    );
}

/**
 * Moves a cart line to the wishlist.
 *
 * A cart line only carries the handful of fields the cart renders, while the
 * wishlist keeps a full product snapshot — so the product is read back through
 * `fetchQuery`, which serves the detail cache when the page has already been
 * visited and calls `GET /product/:id` only when it has not. The line leaves
 * the cart only after the save succeeds.
 */
export function useSaveForLater() {
    const { t } = useTranslation();
    const errorMessage = useErrorMessage();
    const queryClient = useQueryClient();
    const addToWishlist = useWishlistStore((state) => state.add);
    const removeFromCart = useCartStore((state) => state.removeItem);

    return useMutation<void, ApiError, { productId: string; title: string }>({
        mutationFn: async ({ productId }) => {
            const product = await queryClient.fetchQuery({
                queryKey: queryKeys.products.detail(productId),
                queryFn: () => getProduct(productId),
            });
            addToWishlist(product);
        },
        onSuccess: (_result, { productId, title }) => {
            removeFromCart(productId);
            toast.success(t("toast.movedToWishlist"), title);
        },
        onError: (error) => toast.error(t("toast.saveFailed"), errorMessage(error)),
    });
}
