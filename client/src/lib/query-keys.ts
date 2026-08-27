import type { PaginationParams } from "@/types/api.types";

/**
 * Every TanStack Query key in one place, so invalidation after a mutation can
 * target a whole domain (`queryKeys.products.all`) without guessing at strings.
 */
export const queryKeys = {
    auth: {
        me: ["auth", "me"] as const,
    },
    products: {
        all: ["products"] as const,
        list: (params: PaginationParams) => ["products", "list", params] as const,
        byCategory: (categoryId: string, params: PaginationParams) =>
            ["products", "category", categoryId, params] as const,
        detail: (productId: string) => ["products", "detail", productId] as const,
    },
    categories: {
        all: ["categories"] as const,
        list: (params: PaginationParams) => ["categories", "list", params] as const,
        full: ["categories", "full"] as const,
        detail: (categoryId: string) => ["categories", "detail", categoryId] as const,
    },
    reviews: {
        all: ["reviews"] as const,
        byProduct: (productId: string, params: PaginationParams) =>
            ["reviews", productId, params] as const,
        ofProduct: (productId: string) => ["reviews", productId] as const,
    },
    orders: {
        all: ["orders"] as const,
        mine: (params: PaginationParams) => ["orders", "mine", params] as const,
    },
    seller: {
        all: ["seller"] as const,
        products: (params: PaginationParams) => ["seller", "products", params] as const,
        orders: (params: PaginationParams) => ["seller", "orders", params] as const,
    },
    users: {
        all: ["users"] as const,
        list: (params: PaginationParams) => ["users", "list", params] as const,
    },
    moderation: {
        all: ["moderation"] as const,
        warnings: (userId: string) => ["moderation", "warnings", userId] as const,
    },
    search: {
        all: ["search"] as const,
        products: (term: string) => ["search", "products", term] as const,
        categories: (term: string) => ["search", "categories", term] as const,
        users: (term: string) => ["search", "users", term] as const,
    },
} as const;
