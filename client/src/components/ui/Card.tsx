import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Card({
    className,
    children,
    /** Adds a hover lift. Only for cards that are themselves a link or a target. */
    interactive = false,
}: {
    className?: string;
    children: ReactNode;
    interactive?: boolean;
}) {
    return (
        <div
            className={cn(
                "rounded-xl border border-ink-200 bg-surface elev-1",
                interactive &&
                    "transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-brand-200 hover:elev-2",
                className,
            )}
        >
            {children}
        </div>
    );
}

export function CardHeader({
    title,
    description,
    action,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-start justify-between gap-3 border-b border-ink-200 px-5 py-4 sm:px-6",
                className,
            )}
        >
            <div className="min-w-0">
                <h2 className="text-[0.9375rem] font-semibold tracking-tight text-ink-900">
                    {title}
                </h2>
                {description ? (
                    <p className="mt-1 text-sm text-ink-500">{description}</p>
                ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

export function CardBody({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return <div className={cn("px-5 py-4 sm:px-6", className)}>{children}</div>;
}

export function CardFooter({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                "flex flex-wrap items-center justify-end gap-2 border-t border-ink-200 px-5 py-3 sm:px-6",
                className,
            )}
        >
            {children}
        </div>
    );
}
