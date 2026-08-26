import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
            {children}
        </div>
    );
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
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
                        {title}
                    </h1>
                    {description ? (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
                            {description}
                        </p>
                    ) : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
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
            <div className="animate-float absolute -left-32 -top-40 size-[32rem] rounded-full bg-brand-500/18 blur-3xl" />
            <div
                className="animate-float absolute -right-24 top-10 size-[26rem] rounded-full bg-accent-500/15 blur-3xl"
                style={{ animationDelay: "-3s" }}
            />
            <div
                className="animate-float absolute bottom-[-14rem] left-1/3 size-[24rem] rounded-full bg-brand-400/15 blur-3xl"
                style={{ animationDelay: "-6s" }}
            />
        </div>
    );
}
