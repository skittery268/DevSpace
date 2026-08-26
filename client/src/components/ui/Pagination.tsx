"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

interface PaginationProps {
    page: number;
    pageCount: number;
    onPageChange: (page: number) => void;
    className?: string;
    /** Disabled while a page is in flight, so rapid clicks cannot stack requests. */
    disabled?: boolean;
}

/** Builds a compact window of page numbers with ellipses at the edges. */
function buildPages(page: number, pageCount: number): Array<number | "gap"> {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const pages: Array<number | "gap"> = [1];
    const start = Math.max(2, page - 1);
    const end = Math.min(pageCount - 1, page + 1);

    if (start > 2) pages.push("gap");
    for (let current = start; current <= end; current += 1) pages.push(current);
    if (end < pageCount - 1) pages.push("gap");

    pages.push(pageCount);
    return pages;
}

export function Pagination({
    page,
    pageCount,
    onPageChange,
    className,
    disabled = false,
}: PaginationProps) {
    const { t } = useTranslation();

    if (pageCount <= 1) return null;

    const pages = buildPages(page, pageCount);

    const stepClass =
        "inline-flex size-10 items-center justify-center rounded-lg border border-ink-200 bg-surface text-ink-600 " +
        "transition-[background-color,border-color,color,transform] duration-200 hover:border-ink-300 hover:bg-ink-100 hover:text-ink-900 " +
        "active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface";

    return (
        <nav
            aria-label={t("pagination.label")}
            className={cn("flex flex-wrap items-center justify-center gap-1.5", className)}
        >
            <button
                type="button"
                className={stepClass}
                onClick={() => onPageChange(page - 1)}
                disabled={disabled || page <= 1}
                aria-label={t("pagination.previous")}
            >
                <ChevronLeft className="size-4" />
            </button>

            {pages.map((entry, index) =>
                entry === "gap" ? (
                    <span
                        key={`gap-${index}`}
                        aria-hidden
                        className="px-1 text-sm text-ink-400"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={entry}
                        type="button"
                        onClick={() => onPageChange(entry)}
                        disabled={disabled}
                        aria-current={entry === page ? "page" : undefined}
                        aria-label={t("pagination.page", { page: entry })}
                        className={cn(
                            "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-2.5 text-sm font-medium tabular-nums",
                            "transition-[background-color,border-color,color,transform] duration-200 active:scale-95",
                            entry === page
                                ? "border-transparent brand-fill"
                                : "border-ink-200 bg-surface text-ink-600 hover:border-ink-300 hover:bg-ink-100 hover:text-ink-900",
                            disabled && "cursor-not-allowed opacity-60",
                        )}
                    >
                        {entry}
                    </button>
                ),
            )}

            <button
                type="button"
                className={stepClass}
                onClick={() => onPageChange(page + 1)}
                disabled={disabled || page >= pageCount}
                aria-label={t("pagination.next")}
            >
                <ChevronRight className="size-4" />
            </button>
        </nav>
    );
}
