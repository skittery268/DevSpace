import type { Metadata } from "next";
import { Suspense } from "react";

import { Container, PageHeader } from "@/components/common/Container";
import { ProductGridSkeleton } from "@/components/product/ProductCard";
import { ProductCatalog } from "@/components/product/ProductCatalog";
import { APP_NAME } from "@/lib/constants";
import {
    absoluteUrl,
    OG_LOCALES,
    paginatedCanonical,
    readPageParam,
} from "@/lib/seo";
import { getServerTranslation } from "@/i18n/server";

/**
 * The list is paginated through `?page=`, which `usePageParam` writes and this
 * reads back, so the canonical a crawler is handed is the page it is actually
 * looking at. Google's guidance for a series is a self-referencing canonical:
 * collapsing every page onto page one hides every listing past the first slice.
 * Page one drops the parameter, so `/products` and `/products?page=1` stay one URL.
 */
export async function generateMetadata({
    searchParams,
}: PageProps<"/products">): Promise<Metadata> {
    const { page: pageParam } = await searchParams;
    const { t, locale } = await getServerTranslation();

    const page = readPageParam(pageParam);
    const canonical = paginatedCanonical("/products", page);

    const base = t("products.title");
    const title = page > 1 ? `${base} — ${t("seo.pageSuffix", { page })}` : base;
    const description = t("products.metaDescription", { app: APP_NAME });

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            type: "website",
            title,
            description,
            url: absoluteUrl(canonical),
            locale: OG_LOCALES[locale],
        },
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
