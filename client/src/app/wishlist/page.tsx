import type { Metadata } from "next";

import { Container, PageHeader } from "@/components/common/Container";
import { WishlistView } from "@/components/wishlist/WishlistView";
import { APP_NAME } from "@/lib/constants";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("wishlist.title"),
        description: t("wishlist.metaDescription", { app: APP_NAME }),
    };
}

/**
 * The wishlist is client-only state: the API has no wishlist model, controller
 * or route, so — exactly like the cart — it lives in a persisted zustand store
 * and this page renders whatever that store holds. No session required.
 */
export default async function WishlistPage() {
    const { t } = await getServerTranslation();

    return (
        <Container className="py-page">
            <PageHeader
                title={t("wishlist.title")}
                description={t("wishlist.subtitle")}
            />
            <WishlistView />
        </Container>
    );
}
