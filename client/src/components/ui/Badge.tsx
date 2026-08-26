import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type BadgeTone =
    | "neutral"
    | "brand"
    | "success"
    | "warning"
    | "danger"
    | "info";

/**
 * Every tone is a semantic token trio (fill / text / hairline) so the badge
 * keeps its meaning — and its contrast — in both themes.
 */
const TONES: Record<BadgeTone, string> = {
    neutral: "bg-ink-100 text-ink-700 ring-ink-200",
    brand: "bg-brand-soft text-link ring-brand-line",
    success: "bg-success-soft text-success-strong ring-success-line",
    warning: "bg-warning-soft text-warning-strong ring-warning-line",
    danger: "bg-danger-soft text-danger-strong ring-danger-line",
    info: "bg-info-soft text-info-strong ring-info-line",
};

export function Badge({
    tone = "neutral",
    className,
    children,
}: {
    tone?: BadgeTone;
    className?: string;
    children: ReactNode;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.6875rem] font-semibold tracking-[0.01em] ring-1 ring-inset",
                TONES[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
