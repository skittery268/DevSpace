import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/CheckoutView";
import { RequireAuth } from "@/components/common/RouteGuard";
import { Container, PageHeader } from "@/components/common/Container";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("checkout.title"),
    };
}

export default async function CheckoutPage() {
    const { t } = await getServerTranslation();

    return (
        <RequireAuth>
            <Container className="py-page">
                <PageHeader
                    title={t("checkout.title")}
                    description={t("checkout.subtitle")}
                />
                <CheckoutView />
            </Container>
        </RequireAuth>
    );
}
