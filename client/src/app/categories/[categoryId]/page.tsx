import type { Metadata } from "next";

import { CategoryProducts } from "@/components/category/CategoryProducts";
import { JsonLd } from "@/components/seo/JsonLd";
import { getServerTranslation } from "@/i18n/server";
import { APP_NAME } from "@/lib/constants";
import { loadCategory, loadCategoryProductCount } from "@/lib/seo-data";
import {
    absoluteUrl,
    OG_LOCALES,
    paginatedCanonical,
    readPageParam,
    toMetaDescription,
    toMetaTitle,
} from "@/lib/seo";
import {
    breadcrumbSchema,
    categoryCollectionSchema,
    jsonLdGraph,
} from "@/lib/structured-data";

/**
 * Metadata for one category.
 *
 * The category itself comes from a walk of the paginated list, because the API
 * has no `GET /category/:id` — the same lookup the client does, memoised per
 * request so the page below reuses it rather than walking twice.
 *
 * A category that cannot be resolved is *not* a 404 here. `findCategoryById`
 * returns `null` both for a deleted category and for a list it could not
 * finish reading, and those must not be conflated: the page still renders its
 * product grid from the client's own query, so it degrades to generic metadata
 * and stays out of the index instead of hard-failing.
 */
export async function generateMetadata({
    params,
    searchParams,
}: PageProps<"/categories/[categoryId]">): Promise<Metadata> {
    const { categoryId } = await params;
    const { page: pageParam } = await searchParams;
    const { t, locale } = await getServerTranslation();

    const category = await loadCategory(categoryId);
    const page = readPageParam(pageParam);
    const canonical = paginatedCanonical(`/categories/${categoryId}`, page);

    if (!category) {
        return {
            title: t("categories.unknownCategory"),
            robots: { index: false, follow: true },
            alternates: { canonical },
        };
    }

    const name = toMetaTitle(category.name, t("categories.title"));

    // Page 2 and beyond say so, so a paginated slice never ships the same title
    // as page one — duplicate titles across a series is what makes Search
    // Console flag them as competing pages.
    const title =
        page > 1 ? `${name} — ${t("seo.pageSuffix", { page })}` : name;

    const description = toMetaDescription(
        category.description,
        t("seo.categoryDescriptionFallback", { name: category.name, app: APP_NAME }),
    );

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
            ...(category.imageUrl
                ? { images: [{ url: category.imageUrl, alt: category.name }] }
                : {}),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(category.imageUrl ? { images: [category.imageUrl] } : {}),
        },
    };
}

export default async function CategoryPage({
    params,
}: PageProps<"/categories/[categoryId]">) {
    const { categoryId } = await params;
    const { t } = await getServerTranslation();

    const category = await loadCategory(categoryId);
    // The total the page prints above its grid, and the only figure honest
    // enough to publish as `numberOfItems`.
    const total = category ? await loadCategoryProductCount(categoryId) : null;

    return (
        <>
            {category ? (
                <JsonLd
                    data={jsonLdGraph(
                        categoryCollectionSchema(
                            category,
                            toMetaDescription(
                                category.description,
                                t("seo.categoryDescriptionFallback", {
                                    name: category.name,
                                    app: APP_NAME,
                                }),
                            ),
                            total,
                        ),
                        /*
                         * Exactly the trail `CategoryProducts` renders. A parent
                         * category is deliberately not inserted here: the page
                         * shows it as a badge beside the heading rather than as
                         * a crumb, and breadcrumb markup that claims a path the
                         * page does not display is what gets the rich result
                         * dropped.
                         */
                        breadcrumbSchema([
                            { name: t("nav.categories"), path: "/categories" },
                            { name: category.name, path: `/categories/${category.id}` },
                        ]),
                    )}
                />
            ) : null}
            <CategoryProducts categoryId={categoryId} />
        </>
    );
}
