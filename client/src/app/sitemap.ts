import type { MetadataRoute } from "next";

import { MAX_PAGE_SIZE } from "@/lib/constants";
import { absoluteUrl } from "@/lib/seo";
import { getAllCategories } from "@/services/category.service";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product.types";

/**
 * The sitemap, built from the live catalog.
 *
 * Regenerated hourly rather than per request: the catalog is a marketplace, so
 * it changes often enough that a build-time snapshot goes stale, but not so
 * often that a crawler needs the current second. An hour also puts a ceiling on
 * what this costs the API — one walk of the catalog, not one per crawl.
 */
export const revalidate = 3600;

/**
 * How many listings to publish, at most.
 *
 * The protocol's own ceiling is 50,000 URLs per file, but the real constraint
 * here is the backend: every page costs one request, capped at 100 rows by the
 * controller. Fifty pages is a catalog of 5,000 listings for fifty requests an
 * hour. A catalog that outgrows this should move to `generateSitemaps()` and
 * shard by index rather than raise the cap — see SEO_AUDIT.md.
 */
const MAX_PRODUCT_PAGES = 50;

/** Walks the paginated product endpoint, stopping at the cap. */
async function collectProducts(): Promise<Product[]> {
    const products: Product[] = [];

    for (let page = 1; page <= MAX_PRODUCT_PAGES; page += 1) {
        const result = await getProducts({ page, limit: MAX_PAGE_SIZE });
        products.push(...result.items);
        if (page >= result.pageCount || result.items.length === 0) break;
    }

    return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    /**
     * The three pages that exist whether or not anything is listed. Only public
     * routes appear: no cart, account, checkout, auth or staff console, and no
     * `/search`, which needs a session. Nothing in this file is `noindex`.
     */
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: absoluteUrl("/"),
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: absoluteUrl("/products"),
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: absoluteUrl("/categories"),
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.8,
        },
    ];

    /**
     * A backend that is down must not empty the sitemap: submitting a file with
     * three URLs where there were thousands reads to a crawler as a catalog
     * that has been deleted. Falling back to the static routes keeps the file
     * valid and lets the next revalidation repair it.
     */
    let products: Product[] = [];
    let categories: Awaited<ReturnType<typeof getAllCategories>> = [];

    try {
        [products, categories] = await Promise.all([
            collectProducts(),
            getAllCategories(),
        ]);
    } catch {
        return staticRoutes;
    }

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
        url: absoluteUrl(`/categories/${category.id}`),
        // The mapper does not carry `updatedAt`, so this is the creation date —
        // a real timestamp rather than an invented "now" for every category.
        lastModified: new Date(category.createdAt),
        changeFrequency: "weekly",
        priority: 0.7,
        ...(category.imageUrl ? { images: [category.imageUrl] } : {}),
    }));

    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
        url: absoluteUrl(`/products/${product.id}`),
        lastModified: new Date(product.updatedAt),
        changeFrequency: "weekly",
        priority: 0.6,
        // An image sitemap entry, so listing photos can surface in image search.
        ...(product.images.length > 0 ? { images: product.images } : {}),
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
