"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/useAuth";
import { ApiError } from "@/lib/api-error";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { hasSellerArea } from "@/lib/permissions";
import { queryKeys } from "@/lib/query-keys";
import * as categoryService from "@/services/category.service";
import * as sellerService from "@/services/seller.service";
import type { Paginated } from "@/types/api.types";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import type { SellerOrder } from "@/types/seller.types";

/**
 * The seller area's data.
 *
 * Both routes are `allowedTo("seller", "admin", "moderator")` and both scope
 * their query to the caller, so the question they answer is "what do I sell".
 * The queries stay disabled for anyone outside that role list, so no request is
 * fired that is certain to come back 403.
 */

/**
 * `GET /seller/products`, re-hydrated.
 *
 * The controller reads with `.lean()` and no populate, so each product arrives
 * with `category` and `sellerId` as bare ids that `mapProduct` turns into
 * `null`. Two things are lost with them, and both are put back here rather
 * than by asking the server for anything extra:
 *
 *   - **the seller**, filled from the session. Every row this endpoint returns
 *     is by definition the caller's, so this is a restatement of the query, not
 *     a guess — and without it `canEditProduct` sees `seller: null`, decides
 *     the row belongs to someone else, and hides its own edit button.
 *   - **the category**, looked up in the category list the app already caches
 *     for the product form. No extra request: on a warm cache it is free, and
 *     on a cold one it is the same fetch the "list a product" dialog needs.
 */
export function useSellerProducts(page: number, limit = DEFAULT_PAGE_SIZE) {
    const { user } = useAuth();
    const enabled = hasSellerArea(user);

    /**
     * The same query as `useAllCategories` — same key, same function, so the two
     * share one cache entry and one request — but gated alongside the products
     * it decorates, so nobody who cannot see the table pays for the lookup.
     */
    const categories = useQuery<Category[], ApiError>({
        queryKey: queryKeys.categories.full,
        queryFn: categoryService.getAllCategories,
        staleTime: 5 * 60_000,
        enabled,
    });

    const query = useQuery<Paginated<Product>, ApiError>({
        queryKey: queryKeys.seller.products({ page, limit }),
        queryFn: () => sellerService.getSellerProducts({ page, limit }),
        enabled,
        placeholderData: keepPreviousData,
    });

    const categoriesById = useMemo(() => {
        const map = new Map<string, Category>();
        for (const category of categories.data ?? []) map.set(category.id, category);
        return map;
    }, [categories.data]);

    const data = useMemo(() => {
        if (!query.data || !user) return query.data;

        return {
            ...query.data,
            items: query.data.items.map((product) => ({
                ...product,
                seller:
                    product.seller ?? {
                        id: user._id,
                        fullname: user.fullname,
                        role: user.role,
                    },
                category:
                    product.category ??
                    (product.categoryId
                        ? categoriesById.get(product.categoryId) ?? null
                        : null),
            })),
        };
    }, [query.data, user, categoriesById]);

    // The category list only decorates rows, so a slow or failed lookup must not
    // hold the table back — `isPending` stays the products request's own.
    return { ...query, data };
}

/** `GET /seller/orders` — paginated and counted server-side by a `$facet`. */
export function useSellerOrders(page: number, limit = DEFAULT_PAGE_SIZE) {
    const { user } = useAuth();

    return useQuery<Paginated<SellerOrder>, ApiError>({
        queryKey: queryKeys.seller.orders({ page, limit }),
        queryFn: () => sellerService.getSellerOrders({ page, limit }),
        enabled: hasSellerArea(user),
        placeholderData: keepPreviousData,
    });
}
