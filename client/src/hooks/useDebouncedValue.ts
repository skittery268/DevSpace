"use client";

import { useEffect, useState } from "react";

/** Keeps a fast-changing value (a search box) from driving a request per keystroke. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timeout = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timeout);
    }, [value, delay]);

    return debounced;
}
