"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

import { readNumberParam } from "@/lib/utils";

/**
 * Keeps the current page in the URL so a paginated list is linkable and
 * survives a refresh or a back navigation.
 */
export function usePageParam(key = "page") {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const page = readNumberParam(searchParams.get(key), 1);

    const setPage = useCallback(
        (next: number) => {
            const params = new URLSearchParams(searchParams.toString());
            if (next <= 1) params.delete(key);
            else params.set(key, String(next));

            const query = params.toString();
            router.push(query ? `${pathname}?${query}` : pathname, { scroll: true });
        },
        [key, pathname, router, searchParams],
    );

    return { page, setPage };
}
