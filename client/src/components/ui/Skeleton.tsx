import { cn } from "@/lib/utils";

/**
 * A sweeping placeholder rather than a pulsing block: the movement reads as
 * "content is on its way" instead of "this control is disabled".
 */
export function Skeleton({ className }: { className?: string }) {
    // A block-displayed `span` rather than a `div`: placeholders stand in for
    // values that live inside `<p>`, `<dd>` and headings, and a `<div>` in a
    // `<p>` is invalid HTML the browser silently reparents — which shows up as a
    // hydration mismatch, not as a layout bug.
    return (
        <span aria-hidden className={cn("block skeleton-sheen rounded-lg", className)} />
    );
}

export function SkeletonText({
    lines = 3,
    className,
}: {
    lines?: number;
    className?: string;
}) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, index) => (
                <Skeleton
                    key={index}
                    className={cn("h-3", index === lines - 1 ? "w-2/3" : "w-full")}
                />
            ))}
        </div>
    );
}
