"use client";

import { usePathname } from "next/navigation";

import { Footer } from "./Footer";
import { Header } from "./Header";

/**
 * The storefront's header and footer, withheld from the admin console.
 *
 * `/admin` renders its own sidebar and top bar and owns the full viewport, the
 * way a console is expected to. Stacking the shop header above it would give
 * the page two navigation systems and two rows of avatars — so the chrome is
 * chosen here, in one place, instead of every admin screen compensating.
 */
function useIsConsole() {
    const pathname = usePathname();
    return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function SiteHeader() {
    return useIsConsole() ? null : <Header />;
}

export function SiteFooter() {
    return useIsConsole() ? null : <Footer />;
}
