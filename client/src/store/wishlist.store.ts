"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Product } from "@/types/product.types";

/**
 * The wishlist, entirely on the client.
 *
 * The backend has no wishlist model, controller or route — the same situation
 * the cart is in — so it lives here, persisted to localStorage, and follows
 * `store/cart.store.ts` deliberately: one shape to learn, one place to look.
 *
 * The whole mapped `Product` is kept rather than a handful of fields. It costs
 * a couple of kilobytes per entry and buys three things: the wishlist page
 * renders the same `ProductCard` as every other grid, "add to cart" reuses the
 * existing cart entry point unchanged, and opening the page fires no requests.
 * Prices and stock in that snapshot are a display hint only — exactly like the
 * cart's — because the checkout controller re-reads both from the database.
 */

export interface WishlistEntry {
    product: Product;
    /** ISO timestamp, so the list can show newest first without a second store. */
    addedAt: string;
}

interface WishlistState {
    entries: WishlistEntry[];

    add: (product: Product) => void;
    remove: (productId: string) => void;
    /** Adds or removes, and reports the state the product ended up in. */
    toggle: (product: Product) => boolean;
    clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            entries: [],

            add: (product) =>
                set((state) => {
                    const existing = state.entries.find(
                        (entry) => entry.product.id === product.id,
                    );

                    // Re-adding refreshes the snapshot instead of duplicating the entry,
                    // so a product opened again picks up its current price and stock.
                    if (existing) {
                        return {
                            entries: state.entries.map((entry) =>
                                entry.product.id === product.id ? { ...entry, product } : entry,
                            ),
                        };
                    }

                    return {
                        entries: [
                            { product, addedAt: new Date().toISOString() },
                            ...state.entries,
                        ],
                    };
                }),

            remove: (productId) =>
                set((state) => ({
                    entries: state.entries.filter((entry) => entry.product.id !== productId),
                })),

            toggle: (product) => {
                const isSaved = get().entries.some(
                    (entry) => entry.product.id === product.id,
                );
                if (isSaved) {
                    get().remove(product.id);
                    return false;
                }
                get().add(product);
                return true;
            },

            clear: () => set({ entries: [] }),
        }),
        {
            name: "devspace-wishlist",
            storage: createJSONStorage(() => localStorage),
            version: 1,
            partialize: (state) => ({ entries: state.entries }),
        },
    ),
);

/* Selectors — derived values stay out of persisted state. */

export function selectWishlistCount(state: WishlistState): number {
    return state.entries.length;
}

export function selectIsInWishlist(productId: string) {
    return (state: WishlistState): boolean =>
        state.entries.some((entry) => entry.product.id === productId);
}
