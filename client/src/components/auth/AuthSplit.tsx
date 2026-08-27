"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { AuthLink } from "./AuthCard";
import { AuroraBackdrop } from "@/components/common/Container";
import { Logo } from "@/components/layout/Logo";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * The frame the two account screens share: a brand plane beside the form.
 *
 * Only sign-in and sign-up use it. The password-reset and 2FA screens stay on
 * the narrow centred card in `(auth)/layout.tsx` — they are interruptions in a
 * flow, not front doors, and giving them a full brand panel would make an error
 * recovery look like a landing page.
 *
 * The cross-link ("no account yet?") lives in the plane on desktop, where the
 * reference composition puts it, and falls back to a footer line under the form
 * once the two halves stack — a translucent card on a gradient strip that is
 * only 200px tall reads as clutter.
 */
type AuthSplitVariant = "signIn" | "signUp";

const COPY = {
    signIn: {
        headline: "auth.brandSignInTitle",
        lead: "auth.brandSignInBody",
        crossText: "auth.loginFooter",
        crossLabel: "auth.signUp",
        crossHref: "/register",
    },
    signUp: {
        headline: "auth.brandSignUpTitle",
        lead: "auth.brandSignUpBody",
        crossText: "auth.registerFooter",
        crossLabel: "auth.signIn",
        crossHref: "/login",
    },
} as const;

export function AuthSplit({
    variant,
    children,
}: {
    variant: AuthSplitVariant;
    children: ReactNode;
}) {
    const { t } = useTranslation();
    const copy = COPY[variant];

    // Sign-up carries one more field and pairs two of them on wide screens, so
    // it borrows a column from the plane rather than growing a longer form.
    const wide = variant === "signUp";

    return (
        <div className="relative isolate overflow-hidden px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
            <AuroraBackdrop />

            <div className={cn("mx-auto w-full", wide ? "max-w-6xl" : "max-w-5xl")}>
                <div className="grid overflow-hidden rounded-2xl border border-ink-200 bg-surface elev-3 lg:grid-cols-12">
                    <aside
                        className={cn(
                            "relative isolate overflow-hidden bg-brand-panel text-white",
                            "lg:min-h-[33rem]",
                            wide ? "lg:col-span-5" : "lg:col-span-6",
                        )}
                    >
                        {/*
                            Decoration, in four moves: a hairline grid that fades out
                            before it reaches an edge, two slow-drifting glows, and a pair
                            of oversized rings cropped by the corner. Everything else on
                            the plane is type.
                        */}
                        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                            <div className="absolute inset-0 bg-grid-inverse" />
                            <div className="animate-float absolute -left-24 -top-28 size-[22rem] rounded-full bg-accent-400/26 blur-3xl" />
                            <div
                                className="animate-float absolute -bottom-32 -right-24 size-[26rem] rounded-full bg-brand-400/20 blur-3xl"
                                style={{ animationDelay: "-4.5s" }}
                            />
                            <div className="absolute -bottom-44 -right-32 size-[30rem] rounded-full border border-white/10" />
                            <div className="absolute -bottom-28 -right-16 size-[19rem] rounded-full border border-white/[0.07]" />
                        </div>

                        <div className="relative flex h-full flex-col gap-8 p-6 sm:p-9 lg:gap-10 lg:p-11">
                            <Logo size="lg" tone="inverse" />

                            {/*
                                Set as a paragraph, not a heading: the plane renders
                                before the form in the DOM, and an `h2` here would put
                                the document's second-level heading ahead of its `h1`.
                                It is a slogan, and nothing navigates to it.
                            */}
                            <div className="lg:my-auto">
                                <p className="max-w-xl text-[1.75rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl xl:text-[2.6rem]">
                                    {t(copy.headline)}
                                </p>
                                <p className="mt-3.5 max-w-sm text-sm leading-relaxed text-white/70 sm:text-[0.9375rem]">
                                    {t(copy.lead)}
                                </p>
                            </div>

                            <div className="hidden flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/10 py-3.5 pl-5 pr-3.5 lg:flex">
                                <p className="text-sm font-medium text-white/85">
                                    {t(copy.crossText, { app: APP_NAME })}
                                </p>
                                <Link
                                    href={copy.crossHref}
                                    className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-brand-deep transition-[background-color,transform] duration-200 ease-out hover:bg-white/88 active:scale-[0.98]"
                                >
                                    {t(copy.crossLabel)}
                                    <ArrowRight className="size-4" aria-hidden />
                                </Link>
                            </div>
                        </div>
                    </aside>

                    <div
                        className={cn(
                            "px-5 py-9 sm:px-9 sm:py-11 lg:px-12 lg:py-14",
                            wide ? "lg:col-span-7" : "lg:col-span-6",
                        )}
                    >
                        <div
                            className={cn("mx-auto w-full", wide ? "max-w-lg" : "max-w-sm")}
                        >
                            {children}

                            <div className="mt-8 border-t border-ink-200 pt-5 text-center text-sm text-ink-500 lg:hidden">
                                {t(copy.crossText, { app: APP_NAME })}{" "}
                                <AuthLink href={copy.crossHref}>{t(copy.crossLabel)}</AuthLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Title and subtitle for the form half — the one `h1` on the screen. */
export function AuthHeading({
    title,
    description,
}: {
    title: string;
    description?: ReactNode;
}) {
    return (
        <header>
            <h1 className="text-[1.625rem] font-semibold tracking-[-0.03em] text-ink-900 sm:text-[1.75rem]">
                {title}
            </h1>
            {description ? (
                <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{description}</p>
            ) : null}
        </header>
    );
}
