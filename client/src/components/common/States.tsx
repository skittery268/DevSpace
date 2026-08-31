"use client";

import { PackageOpen, RefreshCw, ServerCrash, WifiOff } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { ApiError, resolveErrorMessage } from "@/lib/api-error";
import { cn } from "@/lib/utils";

/**
 * The three "nothing to render" states.
 *
 * They share a silhouette on purpose — a haloed glyph, a heading, one line of
 * explanation, one action — so an empty grid and a failed request read as the
 * same kind of moment rather than as two unrelated screens.
 */

export function EmptyState({
    title,
    description,
    icon,
    action,
    className,
}: {
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "animate-fade flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-300 bg-surface px-6 py-16 text-center",
                className,
            )}
        >
            <div className="relative mb-4">
                <span
                    aria-hidden
                    className="absolute inset-0 -z-10 rounded-full bg-brand-gradient opacity-25 blur-xl"
                />
                <div className="flex size-14 items-center justify-center rounded-xl border border-brand-line/70 bg-brand-soft text-link">
                    {icon ?? <PackageOpen className="size-6" />}
                </div>
            </div>
            <p className="text-base font-semibold text-ink-900">{title}</p>
            {description ? (
                <p className="mt-1.5 max-w-md text-sm leading-relaxed text-ink-500">
                    {description}
                </p>
            ) : null}
            {action ? <div className="mt-6">{action}</div> : null}
        </div>
    );
}

export function ErrorState({
    error,
    onRetry,
    title,
    className,
}: {
    error: unknown;
    onRetry?: () => void;
    title?: string;
    className?: string;
}) {
    const { t } = useTranslation();

    // A dead connection and a 500 need different words: one is worth retrying
    // immediately, the other usually is not.
    const offline = error instanceof ApiError && error.isNetworkError;
    const heading =
        title ?? (offline ? t("states.offlineTitle") : t("states.errorTitle"));

    return (
        <div
            className={cn(
                "animate-fade flex flex-col items-center justify-center rounded-xl border border-danger-line bg-danger-soft px-6 py-14 text-center",
                className,
            )}
        >
            <div className="mb-4 flex size-14 items-center justify-center rounded-xl border border-danger-line bg-danger-soft text-danger">
                {offline ? <WifiOff className="size-6" /> : <ServerCrash className="size-6" />}
            </div>
            <p className="text-base font-semibold text-danger-strong">{heading}</p>
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-danger-strong/85">
                {resolveErrorMessage(error, t)}
            </p>
            {onRetry ? (
                <Button variant="outline" className="mt-6" onClick={onRetry}>
                    <RefreshCw className="size-4" />
                    {t("states.tryAgain")}
                </Button>
            ) : null}
        </div>
    );
}

/** The heading that opens a section of a page: home, product detail, cart. */
export function SectionHeading({
    eyebrow,
    title,
    description,
    action,
    className,
}: {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-3",
                className,
            )}
        >
            <div className="min-w-0">
                {eyebrow ? (
                    <p className="mb-2.5 flex items-center gap-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-link">
                        <span aria-hidden className="h-px w-6 bg-brand-400" />
                        {eyebrow}
                    </p>
                ) : null}
                <h2 className="text-subtitle wrap-anywhere text-ink-900">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-500">
                        {description}
                    </p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}
