"use client";

import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { selectItemCount, useCartStore } from "@/store/cart.store";

/**
 * Reads the persisted cart safely: counts stay at zero until localStorage has
 * been read, so the server markup and the first client render agree.
 */
export function useCartHydrated(): boolean {
    return useStoreHydrated(useCartStore);
}

export function useCartItemCount(): number {
    const hydrated = useCartHydrated();
    const count = useCartStore(selectItemCount);
    return hydrated ? count : 0;
}
