"use client";

import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Container } from "./Container";
import { EmptyState } from "./States";
import { ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/features/auth/useAuth";
import type { Role } from "@/types/user.types";

function GuardLoading() {
    const { t } = useTranslation();

    return (
        <Container className="flex min-h-[50dvh] items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-ink-500">
                <Spinner className="size-6 text-brand-500" />
                <p className="text-sm">{t("auth.checkingSession")}</p>
            </div>
        </Container>
    );
}

/**
 * Client-side gate for pages that need a session.
 *
 * This is navigation convenience, not enforcement: every protected endpoint is
 * still guarded by `protect` / `allowedTo` on the server, which is what
 * actually decides whether a request succeeds.
 */
export function RequireAuth({
    children,
    redirectTo = "/login",
}: {
    children: ReactNode;
    redirectTo?: string;
}) {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading || isAuthenticated) return;

        const next =
            typeof window !== "undefined"
                ? `${window.location.pathname}${window.location.search}`
                : "/";

        router.replace(`${redirectTo}?next=${encodeURIComponent(next)}`);
    }, [isLoading, isAuthenticated, router, redirectTo]);

    if (isLoading) return <GuardLoading />;
    if (!isAuthenticated) return <GuardLoading />;

    return <>{children}</>;
}

/** Same idea, plus a role check mirroring the route's `allowedTo(...)`. */
export function RequireRole({
    roles,
    children,
}: {
    roles: Role[];
    children: ReactNode;
}) {
    const { t } = useTranslation();
    const { isLoading, isAuthenticated, user } = useAuth();

    return (
        <RequireAuth>
            {isLoading || !isAuthenticated ? (
                <GuardLoading />
            ) : user && roles.includes(user.role) ? (
                <>{children}</>
            ) : (
                <Container className="py-16">
                    <EmptyState
                        icon={<ShieldAlert className="size-6" />}
                        title={t("auth.noAccessTitle")}
                        description={t("auth.noAccessBody")}
                        action={
                            <ButtonLink href="/">{t("auth.backToMarketplace")}</ButtonLink>
                        }
                    />
                </Container>
            )}
        </RequireAuth>
    );
}

/** Keeps signed-in users out of the sign-in and sign-up screens. */
export function RedirectIfAuthenticated({
    children,
    to = "/",
}: {
    children: ReactNode;
    to?: string;
}) {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) router.replace(to);
    }, [isLoading, isAuthenticated, router, to]);

    if (isLoading || isAuthenticated) return <GuardLoading />;

    return <>{children}</>;
}
