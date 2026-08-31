import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The page shell.
 *
 * The measure and the gutters live in the `shell` utility in globals.css, so
 * every page, the header and the footer share one definition — including the
 * two steps that widen the measure above 1536px, which is the difference
 * between an ultra-wide display showing more catalog and showing more margin.
 */
export function Container({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn("shell", className)}>{children}</div>;
}

export function PageHeader({
    title,
    description,
    action,
    breadcrumb,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    breadcrumb?: ReactNode;
    className?: string;
}) {
    return (
        <header className={cn("mb-8", className)}>
            {breadcrumb ? <div className="mb-3">{breadcrumb}</div> : null}
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
                <div className="min-w-0 flex-1">
                    {/* Fluid rather than `text-2xl sm:text-3xl`: the title is the
                            same size relative to the page at every width. */}
                    <h1 className="text-title wrap-anywhere text-ink-900">
                        {title}
                    </h1>
                    {description ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? (
                    <div className="w-full shrink-0 sm:w-auto">{action}</div>
                ) : null}
            </div>
        </header>
    );
}

/**
 * The soft brand wash used behind hero and section backgrounds.
 * Purely decorative, so it is hidden from assistive technology and never
 * intercepts a pointer.
 */
export function AuroraBackdrop({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn(
                "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
                className,
            )}
        >
            {/* Sized with `min()` so the glow scales down with the viewport rather
                    than sitting at a fixed 32rem — on a 320px phone a fixed orb is wider
                    than the screen and only the parent's `overflow-hidden` saves it. */}
            <div className="animate-float absolute -left-32 -top-40 size-[min(32rem,120vw)] rounded-full bg-brand-500/18 blur-3xl" />
            <div
                className="animate-float absolute -right-24 top-10 size-[min(26rem,100vw)] rounded-full bg-accent-500/15 blur-3xl"
                style={{ animationDelay: "-3s" }}
            />
            <div
                className="animate-float absolute bottom-[-14rem] left-1/3 size-[min(24rem,90vw)] rounded-full bg-brand-400/15 blur-3xl"
                style={{ animationDelay: "-6s" }}
            />
        </div>
    );
}
