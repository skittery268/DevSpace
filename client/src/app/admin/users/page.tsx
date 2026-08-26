import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminUserList } from "@/components/admin/AdminUserList";
import { RequireRole } from "@/components/common/RouteGuard";
import { Skeleton } from "@/components/ui/Skeleton";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("moderation.title") };
}

/** Every `/api/v1/admin/*` route and `GET /users` are admin-only. */
export default function AdminUsersPage() {
    return (
        <RequireRole roles={["admin"]}>
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <AdminUserList />
            </Suspense>
        </RequireRole>
    );
}
