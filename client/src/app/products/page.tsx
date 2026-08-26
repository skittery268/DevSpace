import type { Metadata } from "next";
import { Suspense } from "react";

import { Container, PageHeader } from "@/components/common/Container";
import { ProductGridSkeleton } from "@/components/product/ProductCard";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { APP_NAME } from "@/lib/constants";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        title: t("products.title"),
        description: t("products.metaDescription", { app: APP_NAME }),
    };
}

export default async function ProductsPage() {
    const { t } = await getServerTranslation();

    return (
        <Container className="py-10">
            <PageHeader
                title={t("products.title")}
                description={t("products.subtitle")}
            />
            <Suspense fallback={<ProductGridSkeleton />}>
                <ProductCatalog />
            </Suspense>
        </Container>
    );
}
