"use client";

import { useEffect, useState } from "react";

/**
 * Keeps a dismissed element mounted for as long as its closing animation runs.
 *
 * Everything in the app that opens — the dialog, the mobile drawer, the account
 * menu — is rendered from `open ? <panel/> : null`, which animates in and then
 * vanishes on a frame. This is the missing half: `present` stays true through
 * the exit, and `closing` is the flag the panel swaps its animation class on.
 *
 * Opening is applied during render rather than from an effect, so the panel is
 * in the very first commit that `open` is true and its entry animation starts
 * on the same frame as the click, with no empty pass in between.
 *
 * `prefers-reduced-motion` drops the wait to zero: the exit animation is already
 * collapsed to nothing by globals.css, so holding the element for the remaining
 * milliseconds would only delay the close.
 */
export function usePresence(
    open: boolean,
    /** Must match the exit animation's duration. Defaults to `animate-*-out`. */
    duration = 160,
): { present: boolean; closing: boolean } {
    const [present, setPresent] = useState(open);

    if (open && !present) setPresent(true);

    const closing = present && !open;

    useEffect(() => {
        if (!closing) return;

        // globals.css has already collapsed the exit animation to nothing under
        // reduced motion, so there is no animation left to outlive: the wait
        // drops to zero rather than holding a finished panel on screen. It still
        // goes through the timer — unmounting straight from the effect body is
        // the cascading-render pattern the React lint rule is there to catch.
        const wait = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
            ? 0
            : duration;

        const timer = window.setTimeout(() => setPresent(false), wait);
        return () => window.clearTimeout(timer);
    }, [closing, duration]);

    return { present, closing };
}
