import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
    title,
    description,
    children,
    footer,
}: {
    title: string;
    description?: ReactNode;
    children: ReactNode;
    footer?: ReactNode;
}) {
    return (
        <div className="rounded-xl border border-ink-200 bg-surface p-6 elev-2 sm:p-8">
            <h1 className="wrap-anywhere text-[clamp(1.25rem,1.1rem+0.75vw,1.5rem)] font-semibold tracking-tight text-ink-900">
                {title}
            </h1>
            {description ? (
                <p className="mt-2 text-sm leading-relaxed text-ink-500">{description}</p>
            ) : null}
            <div className="mt-7">{children}</div>
            {footer ? (
                <div className="mt-7 border-t border-ink-200 pt-5 text-center text-sm text-ink-500">
                    {footer}
                </div>
            ) : null}
        </div>
    );
}

export function AuthLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link
            href={href}
            className="font-medium text-link transition-colors hover:text-link-strong"
        >
            {children}
        </Link>
    );
}
