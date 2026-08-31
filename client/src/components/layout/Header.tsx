"use client";

import { Heart, Menu, Search, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { HeaderSearch } from "./HeaderSearch";
import {
    LanguageSegmentedControl,
    LanguageSwitcher,
} from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeSegmentedControl, ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { Container } from "@/components/common/Container";
import { useAuth } from "@/features/auth/useAuth";
import { useCartItemCount } from "@/features/cart/useCart";
import { useWishlistCount } from "@/features/wishlist/useWishlist";
import { usePresence } from "@/hooks/usePresence";
import { hasSellerArea, hasStaffArea } from "@/lib/permissions";
import { cn } from "@/lib/utils";

interface NavLink {
    href: string;
    label: string;
}

/**
 * One active treatment across the whole app: a soft emerald pill.
 * The header, the mobile drawer and the admin sidebar all reach for this, so
 * "where am I" looks the same wherever a visitor happens to be.
 */
const NAV_ACTIVE = "bg-brand-soft text-link ring-1 ring-inset ring-brand-line/70";
const NAV_IDLE = "text-ink-500 hover:bg-ink-100 hover:text-ink-900";

/** Cart and wishlist share one shape, so their counters cannot drift apart. */
function CountLink({
    href,
    label,
    count,
    active,
    children,
    className,
}: {
    href: string;
    label: string;
    count: number;
    active?: boolean;
    children: React.ReactNode;
    className?: string;
}) {
    const { t } = useTranslation();

    return (
        <Link
            href={href}
            aria-label={t("nav.countedLink", { label, count })}
            className={cn(
                "touch-target relative inline-flex size-9.5 shrink-0 items-center justify-center rounded-lg",
                "transition-[background-color,color,transform] duration-200 active:scale-95",
                active
                    ? "bg-brand-soft text-link"
                    : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
                className,
            )}
        >
            {children}
            {count > 0 ? (
                <span
                    key={count}
                    className={cn(
                        "animate-pop absolute -right-1 -top-1 flex min-w-[1.125rem] items-center justify-center",
                        "rounded-full bg-brand-600 px-1 text-[10px] font-bold leading-[1.125rem] text-white",
                        // A ring in the header's own colour cuts the counter out of the
                        // icon beneath it instead of letting the two shapes merge.
                        "ring-2 ring-surface",
                    )}
                >
                    {count > 99 ? "99+" : count}
                </span>
            ) : null}
        </Link>
    );
}

export function Header() {
    const { t } = useTranslation();
    const pathname = usePathname();
    const { user, isAuthenticated } = useAuth();
    const cartCount = useCartItemCount();
    const wishlistCount = useWishlistCount();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerPath, setDrawerPath] = useState(pathname);
    const [scrolled, setScrolled] = useState(false);

    // The drawer is the one piece of chrome a phone user opens and closes over
    // and over, so it is the piece where an instant disappearance is most
    // obviously wrong. It stays mounted long enough to slide back up.
    const { present: drawerPresent, closing: drawerClosing } = usePresence(mobileOpen);

    // Any navigation closes the drawer, including one started from inside it.
    // Adjusting during render avoids the extra commit an effect would cause.
    if (drawerPath !== pathname) {
        setDrawerPath(pathname);
        setMobileOpen(false);
    }

    // The header gains a hairline and a stronger blur once the page moves under
    // it, so it stays legible over a scrolling catalog.
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // A drawer that scrolls the page behind it feels broken on a phone. Held
    // until the drawer is actually gone, so the scrollbar does not snap back
    // underneath one that is still sliding away.
    useEffect(() => {
        if (!drawerPresent) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [drawerPresent]);

    const links: NavLink[] = [
        { href: "/products", label: t("nav.products") },
        { href: "/categories", label: t("nav.categories") },
        // Search sits behind `protect` on the server, so it is only offered to
        // signed-in visitors rather than failing with a 401 after the click.
        ...(isAuthenticated ? [{ href: "/search", label: t("nav.search") }] : []),
        ...(hasSellerArea(user) ? [{ href: "/seller", label: t("nav.sell") }] : []),
        ...(hasStaffArea(user) ? [{ href: "/admin", label: t("nav.admin") }] : []),
    ];

    const isActive = (href: string) =>
        pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header
            className={cn(
                "glass sticky top-0 z-40 border-b transition-[border-color,box-shadow] duration-300",
                scrolled ? "border-ink-200 elev-1" : "border-transparent",
            )}
        >
            <Container>
                <div className="flex h-[var(--header-h)] items-center gap-1 sm:gap-2 lg:gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileOpen((value) => !value)}
                        aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
                        aria-expanded={mobileOpen}
                        aria-controls="mobile-navigation"
                        className="touch-target -ml-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 lg:hidden"
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>

                    <Logo className="min-w-0 shrink py-2" />

                    <nav
                        aria-label={t("nav.mainLabel")}
                        className="ml-4 hidden items-center gap-1 lg:flex"
                    >
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={isActive(link.href) ? "page" : undefined}
                                className={cn(
                                    "rounded-lg px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow] duration-200",
                                    isActive(link.href) ? NAV_ACTIVE : NAV_IDLE,
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/*
                        Search is the centrepiece on a wide screen rather than a box wedged
                        between the logo and the icons: `mx-auto` on a flexible track keeps
                        it optically centred whatever the nav happens to contain.
                    */}
                    {isAuthenticated ? (
                        <HeaderSearch className="mx-auto hidden w-full min-w-0 max-w-sm xl:block" />
                    ) : null}

                    <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
                        {isAuthenticated ? (
                            <Link
                                href="/search"
                                aria-label={t("nav.search")}
                                className="touch-target inline-flex size-9.5 shrink-0 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 xl:hidden"
                            >
                                <Search className="size-5" />
                            </Link>
                        ) : null}

                        <LanguageSwitcher className="hidden sm:block" />
                        <ThemeToggle className="hidden sm:inline-flex" />

                        <CountLink
                            href="/wishlist"
                            label={t("nav.wishlist")}
                            count={wishlistCount}
                            active={isActive("/wishlist")}
                            className="hidden sm:inline-flex"
                        >
                            <Heart className="size-5" />
                        </CountLink>

                        <CountLink
                            href="/cart"
                            label={t("nav.cart")}
                            count={cartCount}
                            active={isActive("/cart")}
                        >
                            <ShoppingCart className="size-5" />
                        </CountLink>

                        <div className="ml-1.5 sm:ml-2">
                            <UserMenu />
                        </div>
                    </div>
                </div>
            </Container>

            {/* Mobile drawer. Unmounted once closed so it never traps taps. */}
            {drawerPresent ? (
                <>
                    <button
                        type="button"
                        aria-label={t("nav.closeMenu")}
                        tabIndex={-1}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                            "fixed inset-x-0 bottom-0 top-[var(--header-h)] -z-10 cursor-default bg-scrim/45 backdrop-blur-sm lg:hidden",
                            drawerClosing
                                ? "animate-fade-out pointer-events-none"
                                : "animate-fade",
                        )}
                    />
                    <div
                        id="mobile-navigation"
                        className={cn(
                            "max-h-[calc(100dvh-var(--header-h))] overflow-y-auto overscroll-contain border-t border-ink-200 bg-surface lg:hidden",
                            drawerClosing
                                ? "animate-slide-up pointer-events-none"
                                : "animate-slide-down",
                        )}
                    >
                        <Container className="py-3">
                            {isAuthenticated ? (
                                <HeaderSearch
                                    className="mb-3"
                                    onSubmitted={() => setMobileOpen(false)}
                                />
                            ) : null}

                            <nav aria-label={t("nav.mainLabel")} className="flex flex-col gap-1">
                                {links.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        aria-current={isActive(link.href) ? "page" : undefined}
                                        className={cn(
                                            "touch-target-h flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                            isActive(link.href) ? NAV_ACTIVE : "text-ink-700 hover:bg-ink-100",
                                        )}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                                <Link
                                    href="/wishlist"
                                    className={cn(
                                        "touch-target-h flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                        isActive("/wishlist")
                                            ? NAV_ACTIVE
                                            : "text-ink-700 hover:bg-ink-100",
                                    )}
                                >
                                    <span className="flex min-w-0 items-center gap-2.5 truncate">
                                        <Heart className="size-4 shrink-0" aria-hidden />
                                        {t("nav.wishlist")}
                                    </span>
                                    {wishlistCount > 0 ? (
                                        <span className="shrink-0 rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-semibold tabular-nums text-link">
                                            {wishlistCount}
                                        </span>
                                    ) : null}
                                </Link>
                            </nav>

                            {/*
                                Label above control rather than beside it. The theme
                                control carries three written labels — side by side with
                                its own label it needs ~350px, which a 320px phone does
                                not have. Stacked, each option also gets a third of the
                                row instead of a sliver.
                            */}
                            <div className="mt-3 space-y-4 border-t border-ink-200 pt-4 sm:space-y-3">
                                <div className="space-y-2 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:space-y-0">
                                    <span className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-500">
                                        {t("language.label")}
                                    </span>
                                    <LanguageSegmentedControl className="flex w-full sm:w-auto" />
                                </div>
                                <div className="space-y-2 sm:flex sm:items-center sm:justify-between sm:gap-3 sm:space-y-0">
                                    <span className="block text-xs font-medium uppercase tracking-[0.12em] text-ink-500">
                                        {t("theme.label")}
                                    </span>
                                    <ThemeSegmentedControl className="flex w-full sm:w-auto" />
                                </div>
                            </div>
                        </Container>
                    </div>
                </>
            ) : null}
        </header>
    );
}
