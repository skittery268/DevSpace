"use client";

import {
    ChevronDown,
    Heart,
    LayoutDashboard,
    LogOut,
    Package,
    ShieldCheck,
    Store,
    User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";
import { useLogout } from "@/features/auth/useAuthMutations";
import { usePresence } from "@/hooks/usePresence";
import { roleLabelKey } from "@/lib/constants";
import { hasSellerArea, hasStaffArea } from "@/lib/permissions";
import { cn, initialsOf } from "@/lib/utils";

export function UserMenu() {
    const { t } = useTranslation();
    const { user, isLoading, isAuthenticated } = useAuth();
    const logout = useLogout();
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Kept in the tree while it scales back down. The hook is called before the
    // loading and signed-out branches below return, which is what keeps the
    // hook order stable across all three states this component can render.
    const { present, closing } = usePresence(open);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    if (isLoading) {
        return <div className="skeleton-sheen size-9 rounded-full" />;
    }

    if (!isAuthenticated || !user) {
        return (
            <div className="flex items-center gap-1.5">
                <ButtonLink href="/login" variant="ghost" size="sm">
                    {t("nav.signIn")}
                </ButtonLink>
                <ButtonLink href="/register" size="sm" className="hidden sm:inline-flex">
                    {t("nav.createAccount")}
                </ButtonLink>
            </div>
        );
    }

    const links = [
        { href: "/profile", label: t("nav.account"), icon: UserIcon },
        { href: "/orders", label: t("nav.orders"), icon: Package },
        { href: "/wishlist", label: t("nav.wishlist"), icon: Heart },
        ...(hasSellerArea(user)
            ? [{ href: "/seller", label: t("nav.sellerArea"), icon: Store }]
            : []),
        ...(hasStaffArea(user)
            ? [{ href: "/admin", label: t("nav.adminArea"), icon: LayoutDashboard }]
            : []),
    ];

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label={t("nav.accountMenu")}
                className={cn(
                    "flex items-center gap-1 rounded-full border border-ink-200 bg-surface py-1 pl-1 pr-1.5",
                    "transition-[border-color,box-shadow,transform] duration-200 hover:border-brand-300 hover:elev-1 active:scale-95",
                )}
            >
                <span className="flex size-7 items-center justify-center rounded-full bg-brand-600 text-[0.6875rem] font-bold tracking-wide text-white">
                    {initialsOf(user.fullname) || "?"}
                </span>
                <ChevronDown
                    className={cn(
                        "size-4 text-ink-500 transition-transform duration-200",
                        open && "rotate-180",
                    )}
                    aria-hidden
                />
            </button>

            {present ? (
                <div
                    role="menu"
                    className={cn(
                        "absolute right-0 z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-xl border border-ink-200 bg-surface-2 elev-3",
                        closing ? "animate-scale-out pointer-events-none" : "animate-scale-in",
                    )}
                >
                    <div className="border-b border-ink-200 bg-surface-3 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-ink-900">
                            {user.fullname}
                        </p>
                        <p className="truncate text-xs text-ink-500">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <Badge tone={user.role === "user" ? "neutral" : "brand"}>
                                {t(roleLabelKey(user.role))}
                            </Badge>
                            {user.twoFactorEnabled ? (
                                <Badge tone="success">
                                    <ShieldCheck className="size-3" />
                                    2FA
                                </Badge>
                            ) : null}
                        </div>
                    </div>

                    <nav className="py-1.5">
                        {links.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                role="menuitem"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink-700 transition-colors hover:bg-ink-100 hover:text-ink-900"
                            >
                                <Icon className="size-4 text-ink-400" aria-hidden />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-ink-200 py-1.5">
                        <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                                setOpen(false);
                                logout.mutate();
                            }}
                            disabled={logout.isPending}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-danger-soft disabled:opacity-60"
                        >
                            <LogOut className="size-4" aria-hidden />
                            {logout.isPending ? t("nav.signingOut") : t("nav.signOut")}
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
