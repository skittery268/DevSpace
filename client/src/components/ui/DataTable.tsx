import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Table primitives for the console.
 *
 * A real `<table>`, not a grid of divs: sorting, screen readers and copy-paste
 * all depend on the semantics, and a data grid is the one place where the HTML
 * element is genuinely the right tool.
 *
 * Every table lives inside `TableFrame`, which owns the border, the radius and
 * the horizontal scroll. Narrow screens scroll the table *inside* its frame
 * rather than pushing the page sideways — the single most common responsive
 * failure in an admin panel.
 */
export function TableFrame({
    children,
    className,
    /** Rendered above the table: search, filters, a count. */
    toolbar,
    /** Rendered below: pagination, totals. */
    footer,
}: {
    children: ReactNode;
    className?: string;
    toolbar?: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-ink-200 bg-surface elev-1",
                className,
            )}
        >
            {toolbar ? (
                <div className="flex flex-wrap items-center gap-3 border-b border-ink-200 px-4 py-3 sm:px-5">
                    {toolbar}
                </div>
            ) : null}

            <div className="scrollbar-thin overflow-x-auto">{children}</div>

            {footer ? (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 bg-surface-3 px-4 py-3 sm:px-5">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}

export function Table({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <table className={cn("w-full min-w-[44rem] border-collapse text-left", className)}>
            {children}
        </table>
    );
}

export function THead({ children }: { children: ReactNode }) {
    return (
        <thead className="bg-surface-3">
            <tr className="border-b border-ink-200">{children}</tr>
        </thead>
    );
}

export function TH({
    children,
    className,
    align = "left",
}: {
    children?: ReactNode;
    className?: string;
    align?: "left" | "right" | "center";
}) {
    return (
        <th
            scope="col"
            className={cn(
                "whitespace-nowrap px-4 py-3 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500",
                align === "right" && "text-right",
                align === "center" && "text-center",
                className,
            )}
        >
            {children}
        </th>
    );
}

export function TBody({ children }: { children: ReactNode }) {
    return <tbody className="divide-y divide-ink-200">{children}</tbody>;
}

export function TR({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <tr
            className={cn(
                "transition-colors duration-150 hover:bg-brand-soft/45",
                className,
            )}
        >
            {children}
        </tr>
    );
}

export function TD({
    children,
    className,
    align = "left",
    colSpan,
}: {
    children?: ReactNode;
    className?: string;
    align?: "left" | "right" | "center";
    colSpan?: number;
}) {
    return (
        <td
            colSpan={colSpan}
            className={cn(
                "px-4 py-3.5 align-middle text-sm text-ink-700",
                align === "right" && "text-right",
                align === "center" && "text-center",
                className,
            )}
        >
            {children}
        </td>
    );
}

/** The row a table shows while it is waiting for its first response. */
export function TableSkeletonRows({
    rows = 6,
    columns,
}: {
    rows?: number;
    columns: number;
}) {
    return (
        <TBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                    {Array.from({ length: columns }).map((__, columnIndex) => (
                        <td key={columnIndex} className="px-4 py-3.5">
                            <div
                                className="skeleton-sheen h-4 rounded-md"
                                style={{ width: columnIndex === 0 ? "70%" : "45%" }}
                            />
                        </td>
                    ))}
                </tr>
            ))}
        </TBody>
    );
}
