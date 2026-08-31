import { cache } from "react";

import { findCategoryById } from "@/services/category.service";
import { getProduct, getProductsByCategory } from "@/services/product.service";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";

/**
 * Server-side reads for metadata and structured data. Server components only.
 *
 * Both dynamic pages render their body on the client through react-query, so
 * these are a second, server-only read of the same public endpoints. Each is
 * wrapped in `cache()`, which dedupes it across `generateMetadata` and the page
 * component within one request — the pair costs one API call, not two.
 *
 * `getProduct` is the exception that is allowed to throw: the page needs to
 * tell a deleted listing (404) apart from a backend that is down (500), and
 * swallowing the error here would turn every outage into a soft 404 that
 * de-indexes the whole catalog. The two callers narrow it instead.
 */

export const loadProduct = cache(
    async (productId: string): Promise<Product> => getProduct(productId),
);

/**
 * `null` when the product is gone *or* unreachable.
 *
 * For metadata that distinction does not matter — either way there is no title
 * to build — and a throw inside `generateMetadata` would take down a page whose
 * body can still render from the client's own query.
 */
export const loadProductForMetadata = cache(
    async (productId: string): Promise<Product | null> => {
        try {
            return await loadProduct(productId);
        } catch {
            return null;
        }
    },
);

/**
 * There is no `GET /category/:id`, so this walks the paginated list the same
 * way `findCategoryById` does for the client. Never throws: a category page
 * still renders without its name, and metadata falls back to the generic copy.
 */
export const loadCategory = cache(
    async (categoryId: string): Promise<Category | null> => {
        try {
            return await findCategoryById(categoryId);
        } catch {
            return null;
        }
    },
);

/**
 * The product total for a category, which is the figure the page prints above
 * its grid and the only honest source for `numberOfItems`.
 *
 * Reads a single one-item page: the controller reports `productCount` for the
 * whole category regardless of `limit`, so the rows themselves are not needed.
 */
export const loadCategoryProductCount = cache(
    async (categoryId: string): Promise<number | null> => {
        try {
            const { total } = await getProductsByCategory(categoryId, {
                page: 1,
                limit: 1,
            });
            return total;
        } catch {
            return null;
        }
    },
);
