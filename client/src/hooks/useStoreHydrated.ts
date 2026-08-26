"use client";

import { useCallback, useSyncExternalStore } from "react";

/** The slice of zustand's `persist` API this hook needs. */
interface PersistedStore {
    persist: {
        hasHydrated: () => boolean;
        onFinishHydration: (listener: () => void) => () => void;
    };
}

/** The server never has localStorage, so it always renders the empty state. */
const getServerSnapshot = () => false;

/**
 * Whether a persisted zustand store has finished reading localStorage.
 *
 * Persisted stores hydrate after the first client render, so the server markup
 * and the first client pass would otherwise disagree about the cart count, the
 * wishlist state or the theme. Hydration is an external event, so it is
 * subscribed to rather than mirrored into component state.
 */
export function useStoreHydrated(store: PersistedStore): boolean {
    const subscribe = useCallback(
        (onStoreChange: () => void) => store.persist.onFinishHydration(onStoreChange),
        [store],
    );
    const getSnapshot = useCallback(() => store.persist.hasHydrated(), [store]);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
