import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/utils";

export type StatTone = "brand" | "teal" | "amber" | "neutral";

/**
 * Four tones rather than one.
 *
 * A row of stat cards that are all the same emerald is a row the eye stops
 * reading after the first: the tint is what tells Products from Users at a
 * glance. They stay inside the palette, so it never becomes a fruit salad.
 */
const TONES: Record<StatTone, string> = {
    brand: "bg-brand-soft text-link ring-brand-line/60",
    teal: "bg-accent-500/12 text-accent-600 ring-accent-500/25",
    amber: "bg-warning-soft text-warning-strong ring-warning-line",
    neutral: "bg-ink-100 text-ink-600 ring-ink-200",
};

export function StatCard({
    icon: Icon,
    label,
    value,
    hint,
    tone = "brand",
    href,
    loading = false,
    className,
}: {
    icon: LucideIcon;
    label: string;
    /** Already formatted — the card does no number work of its own. */
    value: ReactNode;
    /** The line under the figure: what it counts, or where it came from. */
    hint?: ReactNode;
    tone?: StatTone;
    href?: string;
    loading?: boolean;
    className?: string;
}) {
    const body = (
        <>
            <div className="flex items-start justify-between gap-3">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                    {label}
                </p>
                <span
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
                        TONES[tone],
                    )}
                >
                    <Icon className="size-4.5" aria-hidden />
                </span>
            </div>

            <p className="mt-3 text-[1.75rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-ink-900 sm:mt-4 sm:text-[2rem]">
                {loading ? <Skeleton className="h-8 w-20" /> : value}
            </p>

            {hint ? (
                <p className="mt-2 text-xs leading-relaxed text-ink-500 sm:mt-2.5">{hint}</p>
            ) : null}
        </>
    );

    const shell = cn(
        "relative flex flex-col rounded-xl border border-ink-200 bg-surface p-4 elev-1 sm:p-5",
        "transition-[transform,box-shadow,border-color] duration-300 ease-out",
        href && "hover:-translate-y-0.5 hover:border-brand-200 hover:elev-2",
        className,
    );

    if (!href) return <div className={shell}>{body}</div>;

    return (
        <Link href={href} className={cn(shell, "group")}>
            {body}
        </Link>
    );
}

export function StatCardGrid({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>
            {children}
        </div>
    );
}
