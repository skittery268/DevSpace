import { AdminShell } from "@/components/admin/AdminShell";
import { RequireRole } from "@/components/common/RouteGuard";

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
