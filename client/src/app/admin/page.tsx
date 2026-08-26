import type { Metadata } from "next";

import { AdminOverview } from "@/components/admin/AdminOverview";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("admin.overviewMeta") };
}

export default function AdminPage() {
    return <AdminOverview />;
}
