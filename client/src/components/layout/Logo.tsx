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
function Mark({ className, tone }: { className?: string; tone: LogoTone }) {
    return (
        <span
            aria-hidden
            className={cn(
                "relative flex shrink-0 items-center justify-center rounded-lg text-white",
                tone === "inverse"
                    ? "bg-white/12 ring-1 ring-inset ring-white/25"
                    : "bg-brand-600 elev-brand",
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

/**
 * `inverse` is for the one place the wordmark sits on a dark brand plane — the
 * auth split screen. It is a tone, not a second logo: the mark and the spacing
 * are the same, only the material changes.
 */
export type LogoTone = "default" | "inverse";

export function Logo({
    className,
    size = "md",
    href = "/",
    tone = "default",
}: {
    className?: string;
    size?: "sm" | "md" | "lg";
    href?: string | null;
    tone?: LogoTone;
}) {
    const mark = size === "lg" ? "size-10" : size === "sm" ? "size-7" : "size-8.5";
    const text = size === "lg" ? "text-xl" : size === "sm" ? "text-[0.9375rem]" : "text-[1.0625rem]";

    const content = (
        <>
            <Mark className={mark} tone={tone} />
            {/* `truncate` rather than a fixed width: the header is a flex row and
                    the wordmark is the one item in it that can afford to lose
                    characters before a control does. */}
            <span
                className={cn(
                    "truncate font-semibold tracking-[-0.02em]",
                    tone === "inverse" ? "text-white" : "text-ink-900",
                    text,
                )}
            >
                {APP_NAME}
            </span>
        </>
    );

    if (!href) {
        return <span className={cn("flex min-w-0 items-center gap-2.5", className)}>{content}</span>;
    }

    return (
        <Link
            href={href}
            className={cn(
                "flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-80",
                className,
            )}
        >
            {content}
        </Link>
    );
}
