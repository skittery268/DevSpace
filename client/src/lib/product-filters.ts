import type { Product } from "@/types/product.types";

/**
 * Client-side sorting and filtering for product lists.
 *
 * This is only ever applied to a list the client already holds *in full* —
 * today that is `GET /search/products`, which the controller returns
 * unpaginated. It must not be pointed at `GET /product`, whose pages come from
 * the server: filtering one page there would silently hide matches sitting on
 * the next one.
 */

export const PRODUCT_SORTS = [
    "relevance",
    "price-asc",
    "price-desc",
    "newest",
    "reviews",
] as const;

export type ProductSort = (typeof PRODUCT_SORTS)[number];

const SORT_LABEL_KEYS = {
    relevance: "sort.relevance",
    "price-asc": "sort.priceAsc",
    "price-desc": "sort.priceDesc",
    newest: "sort.newest",
    reviews: "sort.reviews",
} as const;

/** The sort vocabulary is stable; only its wording is a presentation concern. */
export function sortLabelKey(sort: ProductSort) {
    return SORT_LABEL_KEYS[sort];
}

export interface ProductFilters {
    sort: ProductSort;
    categoryId: string | "all";
    inStockOnly: boolean;
    /** Empty string means "no bound", so a partly-typed number is not a filter. */
    minPrice: string;
    maxPrice: string;
}

export const DEFAULT_PRODUCT_FILTERS: ProductFilters = {
    sort: "relevance",
    categoryId: "all",
    inStockOnly: false,
    minPrice: "",
    maxPrice: "",
};

/** How many filters are narrowing the list, for the "clear" affordance. */
export function activeFilterCount(filters: ProductFilters): number {
    let count = 0;
    if (filters.categoryId !== "all") count += 1;
    if (filters.inStockOnly) count += 1;
    if (filters.minPrice !== "" || filters.maxPrice !== "") count += 1;
    return count;
}

function toBound(value: string): number | null {
    if (value.trim() === "") return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

const SORTERS: Record<ProductSort, ((a: Product, b: Product) => number) | null> = {
    relevance: null,
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
    newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    reviews: (a, b) => b.reviewsCount - a.reviewsCount,
};

export function applyProductFilters(
    products: Product[],
    filters: ProductFilters,
): Product[] {
    const min = toBound(filters.minPrice);
    const max = toBound(filters.maxPrice);

    const filtered = products.filter((product) => {
        if (filters.inStockOnly && product.stock <= 0) return false;
        if (filters.categoryId !== "all" && product.category?.id !== filters.categoryId) {
            return false;
        }
        if (min !== null && product.price < min) return false;
        if (max !== null && product.price > max) return false;
        return true;
    });

    const sorter = SORTERS[filters.sort];
    // `relevance` is whatever order the API returned, so it is left untouched.
    return sorter ? [...filtered].sort(sorter) : filtered;
}

/** The categories actually present in a result set, for the category picker. */
export function categoriesOf(
    products: Product[],
): Array<{ id: string; name: string; count: number }> {
    const seen = new Map<string, { id: string; name: string; count: number }>();

    for (const product of products) {
        if (!product.category) continue;
        const existing = seen.get(product.category.id);
        if (existing) {
            existing.count += 1;
        } else {
            seen.set(product.category.id, {
                id: product.category.id,
                name: product.category.name,
                count: 1,
            });
        }
    }

    return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}
