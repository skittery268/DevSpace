import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";
import { Container, PageHeader } from "@/components/common/Container";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("cart.title"),
    };
}

export default async function CartPage() {
    const { t } = await getServerTranslation();

    return (
        <Container className="py-10">
            <PageHeader
                title={t("cart.title")}
                description={t("cart.subtitle")}
            />
            <CartView />
        </Container>
    );
}
