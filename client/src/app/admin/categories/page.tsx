import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminCategoryList } from "@/components/admin/AdminCategoryList";
import { Skeleton } from "@/components/ui/Skeleton";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("admin.categoriesMeta") };
}

export default function AdminCategoriesPage() {
    return (
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <AdminCategoryList />
        </Suspense>
    );
}
