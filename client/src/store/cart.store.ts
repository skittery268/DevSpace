"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Product } from "@/types/product.types";

/**
 * The backend has no cart model, controller, service or route: the client is
 * expected to assemble `userOrder: [{ id, quantity }]` itself and post it to
 * `/payment/checkout`. So the cart lives entirely here, persisted to
 * localStorage.
 *
 * Price and stock are cached only to render the cart; the checkout controller
 * re-reads both from the database and ignores whatever the client sends.
 */

export interface CartItem {
    productId: string;
    title: string;
    price: number;
    image: string | null;
    /** Stock as of the moment the item was added — refreshed on each add. */
    stock: number;
    sellerId: string | null;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    /**
     * Set when the user is sent to Stripe and cleared on return, so the success
     * page only empties a cart that actually went through checkout.
     */
    checkoutPending: boolean;

    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    setQuantity: (productId: string, quantity: number) => void;
    increment: (productId: string) => void;
    decrement: (productId: string) => void;
    clear: () => void;
    markCheckoutStarted: () => void;
    finishCheckout: () => void;
}

/** Stock is a UX hint only; the server is the authority, so 1 is the floor. */
function clampQuantity(quantity: number, stock: number): number {
    const whole = Math.trunc(quantity);
    if (!Number.isFinite(whole) || whole < 1) return 1;
    if (stock > 0 && whole > stock) return stock;
    return whole;
}

export const useCartStore = create<CartState>()(
    persist(
        (set) => ({
            items: [],
            checkoutPending: false,

            addItem: (product, quantity = 1) =>
                set((state) => {
                    const existing = state.items.find(
                        (item) => item.productId === product.id,
                    );

                    // Adding the same product again raises its quantity instead of
                    // creating a second line — the checkout validator rejects an order
                    // that contains the same product id twice.
                    if (existing) {
                        return {
                            items: state.items.map((item) =>
                                item.productId === product.id
                                    ? {
                                            ...item,
                                            stock: product.stock,
                                            price: product.price,
                                            quantity: clampQuantity(
                                                item.quantity + quantity,
                                                product.stock,
                                            ),
                                        }
                                    : item,
                            ),
                        };
                    }

                    return {
                        items: [
                            ...state.items,
                            {
                                productId: product.id,
                                title: product.title,
                                price: product.price,
                                image: product.images[0] ?? null,
                                stock: product.stock,
                                sellerId: product.seller?.id ?? null,
                                quantity: clampQuantity(quantity, product.stock),
                            },
                        ],
                    };
                }),

            removeItem: (productId) =>
                set((state) => ({
                    items: state.items.filter((item) => item.productId !== productId),
                })),

            setQuantity: (productId, quantity) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity: clampQuantity(quantity, item.stock) }
                            : item,
                    ),
                })),

            increment: (productId) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity: clampQuantity(item.quantity + 1, item.stock) }
                            : item,
                    ),
                })),

            decrement: (productId) =>
                set((state) => ({
                    items: state.items.map((item) =>
                        item.productId === productId
                            ? { ...item, quantity: clampQuantity(item.quantity - 1, item.stock) }
                            : item,
                    ),
                })),

            clear: () => set({ items: [], checkoutPending: false }),
            markCheckoutStarted: () => set({ checkoutPending: true }),
            finishCheckout: () => set({ items: [], checkoutPending: false }),
        }),
        {
            name: "devspace-cart",
            storage: createJSONStorage(() => localStorage),
            version: 1,
            partialize: (state) => ({
                items: state.items,
                checkoutPending: state.checkoutPending,
            }),
        },
    ),
);

/* Selectors — derived values stay out of persisted state. */

export function selectItemCount(state: CartState): number {
    return state.items.reduce((total, item) => total + item.quantity, 0);
}

export function selectSubtotal(state: CartState): number {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function selectQuantityOf(productId: string) {
    return (state: CartState): number =>
        state.items.find((item) => item.productId === productId)?.quantity ?? 0;
}
