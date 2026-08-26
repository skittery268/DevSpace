"use client";

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { queryKeys } from "@/lib/query-keys";
import * as categoryService from "@/services/category.service";
import type { Paginated } from "@/types/api.types";
import type {
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "@/types/category.types";

export function useCategories(page: number, limit = DEFAULT_PAGE_SIZE) {
    return useQuery<Paginated<Category>, ApiError>({
        queryKey: queryKeys.categories.list({ page, limit }),
        queryFn: () => categoryService.getCategories({ page, limit }),
        placeholderData: keepPreviousData,
    });
}

/**
 * The whole category list, used by parent pickers and the product form's
 * attribute editor. Categories change rarely, so this is cached generously.
 */
export function useAllCategories() {
    return useQuery<Category[], ApiError>({
        queryKey: queryKeys.categories.full,
        queryFn: categoryService.getAllCategories,
        staleTime: 5 * 60_000,
    });
}

/** There is no `GET /category/:id`; the record is picked out of the list. */
export function useCategory(categoryId: string) {
    return useQuery<Category | null, ApiError>({
        queryKey: queryKeys.categories.detail(categoryId),
        queryFn: () => categoryService.findCategoryById(categoryId),
        enabled: Boolean(categoryId),
    });
}

function useCategoryInvalidation() {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
    };
}

export function useCreateCategory() {
    const invalidate = useCategoryInvalidation();

    return useMutation<Category, ApiError, CreateCategoryPayload>({
        mutationFn: categoryService.createCategory,
        onSuccess: invalidate,
    });
}

export function useUpdateCategory() {
    const invalidate = useCategoryInvalidation();

    return useMutation<
        Category,
        ApiError,
        { categoryId: string; input: UpdateCategoryPayload }
    >({
        mutationFn: ({ categoryId, input }) =>
            categoryService.updateCategory(categoryId, input),
        onSuccess: () => {
            invalidate();
        },
    });
}

/** Answers 409 when the category still has children or products. */
export function useDeleteCategory() {
    const invalidate = useCategoryInvalidation();

    return useMutation<void, ApiError, string>({
        mutationFn: categoryService.deleteCategory,
        onSuccess: invalidate,
    });
}
