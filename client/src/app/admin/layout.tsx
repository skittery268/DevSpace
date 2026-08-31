import type { Metadata } from "next";

import { AdminShell } from "@/components/admin/AdminShell";
import { RequireRole } from "@/components/common/RouteGuard";
import { NOINDEX_NOFOLLOW } from "@/lib/seo";

/**
 * Declared on the layout rather than on each screen, so `/admin`,
 * `/admin/users` and `/admin/categories` all inherit it — and so does any
 * console page added later, which is the failure mode a per-page directive has.
 * The child pages set only a title, so this is never overridden.
 */
export const metadata: Metadata = { robots: NOINDEX_NOFOLLOW };

/**
 * Category writes allow admin and moderator; everything under `/admin/*` on the
 * API is admin-only. Both roles get in here, and each section states which of
 * them it actually serves.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
    return (
        <RequireRole roles={["admin", "moderator"]}>
            <AdminShell>{children}</AdminShell>
        </RequireRole>
    );
}
