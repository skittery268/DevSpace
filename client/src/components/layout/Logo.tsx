import Link from "next/link";

import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The wordmark, in the one place it is defined.
 * Header, footer, the auth screens and the admin sidebar all render this, so
 * the brand can never drift between them.
 *
 * The mark is drawn rather than set in type: a lettered tile is the default
 * every generated interface reaches for, and it carries no idea. This one is a
 * shell prompt — caret and cursor — which is the one glyph every developer
 * reads instantly, and it survives being shrunk to a favicon.
 */
function Mark({ className }: { className?: string }) {
    return (
        <span
            aria-hidden
            className={cn(
                "relative flex shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white elev-brand",
                className,
            )}
        >
            {/* Hairline along the top edge, the same highlight the primary button
                    carries, so the mark reads as part of the same material. */}
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_1px_0_0_rgb(255_255_255/0.22)]"
            />
            <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-[64%]"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                {/* A shell prompt: the caret, then the cursor rule. */}
                <path d="M7 7.5 11.5 12 7 16.5" />
                <path d="M14 16.5h3.5" />
            </svg>
        </span>
    );
}

export function Logo({
    className,
    size = "md",
    href = "/",
}: {
    className?: string;
    size?: "sm" | "md" | "lg";
    href?: string | null;
}) {
    const mark = size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-8.5";
    const text = size === "lg" ? "text-xl" : size === "sm" ? "text-[0.9375rem]" : "text-[1.0625rem]";

    const content = (
        <>
            <Mark className={mark} />
            <span
                className={cn(
                    "font-semibold tracking-[-0.02em] text-ink-900",
                    text,
                )}
            >
                {APP_NAME}
            </span>
        </>
    );

    if (!href) {
        return <span className={cn("flex items-center gap-2.5", className)}>{content}</span>;
    }

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-2.5 transition-opacity hover:opacity-80",
                className,
            )}
        >
            {content}
        </Link>
    );
}
