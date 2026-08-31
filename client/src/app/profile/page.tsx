import type { Metadata } from "next";

import { RequireAuth } from "@/components/common/RouteGuard";
import { ProfileView } from "@/components/profile/ProfileView";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("account.title"),
    };
}

export default function ProfilePage() {
    return (
        <RequireAuth>
            <ProfileView />
        </RequireAuth>
    );
}
