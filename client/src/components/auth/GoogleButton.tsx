"use client";

import { useTranslation } from "react-i18next";

import { Button, type ButtonSize } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { getGoogleAuthUrl } from "@/services/api";

/**
 * Google sign-in is a full-page redirect: Passport answers `GET /auth/google`
 * with a 302 to Google, and the callback sets the session cookie server-side
 * before redirecting back. XHR cannot follow that, so this leaves the SPA.
 */
export function GoogleButton({
    label,
    size = "md",
}: {
    label?: string;
    size?: ButtonSize;
}) {
    const { t } = useTranslation();

    return (
        <Button
            variant="outline"
            size={size}
            fullWidth
            // "Зарегистрироваться через Google" wraps to two lines on a phone, and
            // the size's fixed height would push the second one out of the button.
            className={cn(
                "h-auto py-2.5 text-center leading-snug",
                size === "lg" ? "min-h-12" : "min-h-10",
            )}
            onClick={() => window.location.assign(getGoogleAuthUrl())}
        >
            <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
                <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
                />
                <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                    fill="#FBBC05"
                    d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                />
                <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
                />
            </svg>
            {label ?? t("auth.continueWithGoogle")}
        </Button>
    );
}

/**
 * The seam between the credential form and the identity providers.
 *
 * The rules fade toward the label rather than butting into it, which is the
 * difference between a divider that looks drawn and one that looks like two
 * leftover borders.
 */
export function AuthDivider({
    label,
    className,
}: {
    label?: string;
    className?: string;
}) {
    const { t } = useTranslation();

    return (
        <div className={cn("my-5 flex items-center gap-3.5", className)}>
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-ink-200" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-400">
                {label ?? t("auth.or")}
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-ink-200" />
        </div>
    );
}
