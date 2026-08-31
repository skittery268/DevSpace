"use client";

import {
    ArrowLeft,
    FolderTree,
    LayoutDashboard,
    type LucideIcon,
    Menu,
    Package,
    Store,
    Users,
    X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/useAuth";
import { roleLabelKey } from "@/lib/constants";
import { canManageCategories, canModerate } from "@/lib/permissions";
import { cn, initialsOf } from "@/lib/utils";

interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
    show: boolean;
    /** Leaves the console for a storefront route. */
    external?: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}


/**
 * The admin console shell.
 *
 * A real sidebar rather than a card of links floating in the page: the console
 * owns the viewport, keeps its navigation in the same place on every screen,
 * and collapses to a drawer on a phone. The storefront header is suppressed
 * for these routes by `SiteChrome`, so there is exactly one navigation system
 * on screen at a time.
 */
export function AdminShell({ children }: { children: ReactNode }) {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { user } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerPath, setDrawerPath] = useState(pathname);

    // Navigating from inside the drawer closes it, without the extra commit an
    // effect would cost.
    if (drawerPath !== pathname) {
        setDrawerPath(pathname);
        setDrawerOpen(false);
    }

    useEffect(() => {
        if (!drawerOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setDrawerOpen(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [drawerOpen]);

    const groups: NavGroup[] = [
        {
            label: t("admin.groupConsole"),
            items: [
                {
                    href: "/admin",
                    label: t("admin.dashboard"),
                    icon: LayoutDashboard,
                    show: true,
                },
            ],
        },
        {
            label: t("admin.groupCatalog"),
            items: [
                {
                    href: "/admin/categories",
                    label: t("admin.categories"),
                    icon: FolderTree,
                    show: canManageCategories(user),
                },
                {
                    href: "/products",
                    label: t("admin.products"),
                    icon: Package,
                    show: true,
                    external: true,
                },
            ],
        },
        {
            label: t("admin.groupCommunity"),
            items: [
                {
                    href: "/admin/users",
                    label: t("admin.usersAndModeration"),
                    icon: Users,
                    show: canModerate(user),
                },
            ],
        },
    ]
        .map((group) => ({ ...group, items: group.items.filter((item) => item.show) }))
        .filter((group) => group.items.length > 0);

    const isActive = (href: string, external?: boolean) => {
        if (external) return false;
        return href === "/admin" ? pathname === href : pathname.startsWith(href);
    };

    /** The section name the top bar announces. */
    const currentLabel =
        groups
            .flatMap((group) => group.items)
            .find((item) => isActive(item.href, item.external))?.label ??
        t("admin.dashboard");

    const sidebar = (
        <div className="flex h-full flex-col bg-surface">
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between gap-2 border-b border-ink-200 px-5">
                <Logo href="/admin" />
                <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    aria-label={t("admin.closeNavigation")}
                    className="touch-target -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
                >
                    <X className="size-5" />
                </button>
            </div>

            <nav
                aria-label={t("admin.sections")}
                className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5"
            >
                {groups.map((group, groupIndex) => (
                    <div key={group.label} className={cn(groupIndex > 0 && "mt-7")}>
                        <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-400">
                            {group.label}
                        </p>
                        <ul className="space-y-0.5">
                            {group.items.map(({ href, label, icon: Icon, external }) => {
                                const active = isActive(href, external);
                                return (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            aria-current={active ? "page" : undefined}
                                            className={cn(
                                                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium",
                                                "transition-[background-color,color] duration-200",
                                                active
                                                    ? "bg-brand-soft text-link"
                                                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                                            )}
                                        >
                                            {/* A short emerald tick on the active row. It reads as a
                                                    position marker in a way a filled pill alone does not. */}
                                            <span
                                                aria-hidden
                                                className={cn(
                                                    "absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-brand-600",
                                                    "transition-[opacity,transform] duration-200",
                                                    active ? "opacity-100" : "scale-y-0 opacity-0",
                                                )}
                                            />
                                            <Icon
                                                className={cn(
                                                    "size-4.5 shrink-0 transition-colors",
                                                    active ? "text-brand-600" : "text-ink-400 group-hover:text-ink-600",
                                                )}
                                                aria-hidden
                                            />
                                            <span className="truncate">{label}</span>
                                            {external ? (
                                                <ArrowLeft
                                                    className="ml-auto size-3.5 rotate-135 text-ink-300"
                                                    aria-hidden
                                                />
                                            ) : null}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            <div className="shrink-0 border-t border-ink-200 p-3">
                {user ? (
                    <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[0.6875rem] font-bold text-white">
                            {initialsOf(user.fullname) || "?"}
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-ink-900">
                                {user.fullname}
                            </p>
                            <p className="truncate text-xs text-ink-500">
                                {t(roleLabelKey(user.role))}
                            </p>
                        </div>
                    </div>
                ) : null}

                <Link
                    href="/"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                    <ArrowLeft className="size-4.5 shrink-0 text-ink-400" aria-hidden />
                    {t("admin.backToStorefront")}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-dvh bg-ink-50">
            {/* Desktop rail. Fixed, so the content scrolls under a still sidebar. */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-[var(--admin-rail)] border-r border-ink-200 lg:block">
                {sidebar}
            </aside>

            {/* Mobile drawer, mounted only while open so it never traps taps. */}
            {drawerOpen ? (
                <div className="lg:hidden">
                    <button
                        type="button"
                        aria-label={t("admin.closeNavigation")}
                        tabIndex={-1}
                        onClick={() => setDrawerOpen(false)}
                        className="animate-fade fixed inset-0 z-40 cursor-default bg-scrim/55 backdrop-blur-sm"
                    />
                    <aside
                        className="animate-slide-in-left fixed inset-y-0 left-0 z-50 w-[var(--admin-rail)] max-w-[85vw] border-r border-ink-200 elev-3"
                    >
                        {sidebar}
                    </aside>
                </div>
            ) : null}

            <div className="lg:pl-[var(--admin-rail)]">
                <header className="glass sticky top-0 z-30 border-b border-ink-200">
                    <div className="flex h-[var(--header-h)] items-center gap-2 px-[var(--shell-gutter)] sm:gap-3">
                        <button
                            type="button"
                            onClick={() => setDrawerOpen(true)}
                            aria-label={t("admin.openNavigation")}
                            aria-expanded={drawerOpen}
                            className="touch-target -ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
                        >
                            <Menu className="size-5" />
                        </button>

                        <div className="min-w-0 flex-1 lg:hidden">
                            <Logo href="/admin" size="sm" />
                        </div>

                        <div className="hidden min-w-0 flex-1 lg:block">
                            <p className="truncate text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
                                {t("admin.console")}
                            </p>
                            <p className="truncate text-sm font-semibold text-ink-900">
                                {currentLabel}
                            </p>
                        </div>

                        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
                            <ButtonLink
                                href="/"
                                variant="outline"
                                size="sm"
                                className="hidden sm:inline-flex"
                            >
                                <Store className="size-4" aria-hidden />
                                {t("admin.viewSite")}
                            </ButtonLink>
                            <LanguageSwitcher />
                            <ThemeToggle />
                            {user ? (
                                <Link
                                    href="/profile"
                                    className="flex min-w-0 shrink-0 items-center gap-2.5 rounded-full border border-ink-200 bg-surface p-1 transition-[border-color,box-shadow] duration-200 hover:border-brand-300 hover:elev-1 lg:pr-3"
                                >
                                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[0.6875rem] font-bold text-white">
                                        {initialsOf(user.fullname) || "?"}
                                    </span>
                                    {/* Bounded, or one long account name is enough to widen
                                            the whole bar — `truncate` needs something to
                                            truncate *against*. */}
                                    <span className="hidden min-w-0 max-w-32 text-left lg:block xl:max-w-44">
                                        <span className="block truncate text-xs font-semibold leading-tight text-ink-900">
                                            {user.fullname}
                                        </span>
                                        <span className="block truncate text-[0.6875rem] leading-tight text-ink-500">
                                            {t(roleLabelKey(user.role))}
                                        </span>
                                    </span>
                                </Link>
                            ) : null}
                        </div>
                    </div>
                </header>

                <main className="px-[var(--shell-gutter)] py-7 sm:py-9">
                    <div className="mx-auto max-w-[80rem] 2xl:max-w-[96rem]">{children}</div>
                </main>
            </div>
        </div>
    );
}
