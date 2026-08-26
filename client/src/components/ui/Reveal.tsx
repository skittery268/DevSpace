"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Reveals its children the first time they scroll into view.
 *
 * One IntersectionObserver and two CSS classes rather than an animation
 * library: the whole effect is an opacity and a transform, and a dependency for
 * that would weigh more than it renders.
 *
 * The state lives on the DOM node as a `data-reveal` attribute instead of in
 * React state — nothing else re-renders when a section appears, and the markup
 * ships with no attribute at all, so content stays visible if JavaScript never
 * runs. `prefers-reduced-motion` drops the offset in globals.css.
 */
export function Reveal({
    children,
    delay = 0,
    className,
    as: Tag = "div",
}: {
    children: ReactNode;
    /** Milliseconds, for staggering siblings. Keep under ~200 for a list. */
    delay?: number;
    className?: string;
    as?: ElementType;
}) {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = ref.current;
        // Without an observer there is no reveal — but there is still content,
        // because the element carries no `data-reveal` and so is never hidden.
        if (!element || typeof IntersectionObserver === "undefined") return;

        // Already on screen at mount (above the fold): show it without the offset,
        // so the first screen is never briefly blank.
        if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
            element.dataset.reveal = "shown";
            return;
        }

        element.dataset.reveal = "pending";

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    (entry.target as HTMLElement).dataset.reveal = "shown";
                    observer.disconnect();
                }
            },
            { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    return (
        <Tag
            ref={ref}
            style={
                delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined
            }
            className={className ? cn(className) : undefined}
        >
            {children}
        </Tag>
    );
}
