import type { Metadata } from "next";

import { SellerDashboard } from "@/components/seller/SellerDashboard";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("seller.title") };
}

export default function SellerPage() {
    return <SellerDashboard />;
}
