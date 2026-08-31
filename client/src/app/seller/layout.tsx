import type { Metadata } from "next";

import { RequireRole } from "@/components/common/RouteGuard";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

/** Inherited by every screen in the seller area. */
export const metadata: Metadata = { robots: NOINDEX_NOFOLLOW };

/**
 * Mirrors `allowedTo("seller", "admin", "moderator")` on `/api/v1/seller/*`.
 *
 * The area is about what you own rather than what you may do: each controller
 * scopes its query to the caller, so a moderator who listed products under an
 * earlier role still has a catalog and orders to see here. What they cannot do
 * — create or edit — is gated on the controls themselves.
 */
export default function SellerLayout({ children }: LayoutProps<"/seller">) {
    return (
        <RequireRole roles={["seller", "admin", "moderator"]}>{children}</RequireRole>
    );
}
