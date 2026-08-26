import type { Metadata } from "next";
import { Suspense } from "react";

import { CategoryGridSkeleton } from "@/components/category/CategoryCard";
import { CategoryBrowser } from "@/components/category/CategoryBrowser";
import { Container, PageHeader } from "@/components/common/Container";
import { APP_NAME } from "@/lib/constants";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        title: t("categories.title"),
        description: t("categories.metaDescription", { app: APP_NAME }),
    };
}

export default async function CategoriesPage() {
    const { t } = await getServerTranslation();

    return (
        <Container className="py-10">
            <PageHeader
                title={t("categories.title")}
                description={t("categories.subtitle")}
            />
            <Suspense fallback={<CategoryGridSkeleton />}>
                <CategoryBrowser />
            </Suspense>
        </Container>
    );
}
