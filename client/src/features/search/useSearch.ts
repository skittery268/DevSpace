"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import * as searchService from "@/services/search.service";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";
import type { ApiUser } from "@/types/user.types";

/**
 * All three search endpoints sit behind `protect`, so search is a signed-in
 * feature. None of them paginate — they return every match at once.
 */

export function useProductSearch(term: string, enabled = true) {
    return useQuery<Product[], ApiError>({
        queryKey: queryKeys.search.products(term),
        queryFn: () => searchService.searchProducts(term),
        enabled,
    });
}

export function useCategorySearch(term: string, enabled = true) {
    return useQuery<Category[], ApiError>({
        queryKey: queryKeys.search.categories(term),
        queryFn: () => searchService.searchCategories(term),
        // The controller has no fallback for a missing `name`, so an empty term is
        // never sent: it would build an invalid Mongo query and answer 500.
        enabled: enabled && term.trim().length > 0,
    });
}

export function useUserSearch(term: string, enabled = true) {
    return useQuery<ApiUser[], ApiError>({
        queryKey: queryKeys.search.users(term),
        queryFn: () => searchService.searchUsers(term),
        enabled,
    });
}
