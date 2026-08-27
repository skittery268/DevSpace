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
import * as productService from "@/services/product.service";
import type { Paginated } from "@/types/api.types";
import type {
    CreateProductPayload,
    Product,
    UpdateProductPayload,
} from "@/types/product.types";

export function useProducts(page: number, limit = DEFAULT_PAGE_SIZE) {
    return useQuery<Paginated<Product>, ApiError>({
        queryKey: queryKeys.products.list({ page, limit }),
        queryFn: () => productService.getProducts({ page, limit }),
        // Keeps the current page visible while the next one loads, so pagination
        // does not flash an empty grid.
        placeholderData: keepPreviousData,
    });
}

export function useProductsByCategory(
    categoryId: string,
    page: number,
    limit = DEFAULT_PAGE_SIZE,
) {
    return useQuery<Paginated<Product>, ApiError>({
        queryKey: queryKeys.products.byCategory(categoryId, { page, limit }),
        queryFn: () => productService.getProductsByCategory(categoryId, { page, limit }),
        enabled: Boolean(categoryId),
        placeholderData: keepPreviousData,
    });
}

export function useProduct(productId: string) {
    return useQuery<Product, ApiError>({
        queryKey: queryKeys.products.detail(productId),
        queryFn: () => productService.getProduct(productId),
        enabled: Boolean(productId),
    });
}

function useProductInvalidation() {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
        // A seller's own listing and order views are built from the same rows.
        void queryClient.invalidateQueries({ queryKey: queryKeys.seller.all });
    };
}

export function useCreateProduct() {
    const invalidate = useProductInvalidation();

    return useMutation<Product, ApiError, CreateProductPayload>({
        mutationFn: productService.createProduct,
        onSuccess: invalidate,
    });
}

export function useUpdateProduct() {
    const queryClient = useQueryClient();
    const invalidate = useProductInvalidation();

    return useMutation<Product, ApiError, UpdateProductPayload>({
        mutationFn: productService.updateProduct,
        onSuccess: (product) => {
            queryClient.setQueryData(queryKeys.products.detail(product.id), product);
            invalidate();
        },
    });
}

export function useDeleteProduct() {
    const queryClient = useQueryClient();
    const invalidate = useProductInvalidation();

    return useMutation<void, ApiError, string>({
        mutationFn: productService.deleteProduct,
        onSuccess: (_result, productId) => {
            queryClient.removeQueries({ queryKey: queryKeys.products.detail(productId) });
            // Deleting a product cascades into its reviews on the server.
            void queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
            invalidate();
        },
    });
}
