"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Cross-fades the page on navigation.
 *
 * Keyed on the pathname alone, deliberately: the paginated lists move through
 * `?page=`, and remounting on a query change would throw away the previous
 * page TanStack Query is holding on screen (`keepPreviousData`) and flash an
 * empty grid. Path changes already remount, so the key only replays the
 * animation. `prefers-reduced-motion` collapses it in globals.css.
 */
export function PageTransition({ children }: { children: ReactNode }) {
    const pathname = usePathname();

    return (
        <div key={pathname} className="animate-fade">
            {children}
        </div>
    );
}
