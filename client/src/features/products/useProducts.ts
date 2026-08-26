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
import { searchProducts } from "@/services/search.service";
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

/**
 * A seller's own catalog.
 *
 * The backend has no seller-scoped listing endpoint, and paging through
 * `GET /product` would only ever filter one page at a time — a seller whose
 * products sit on page 5 would see nothing on page 1. `GET /search/products`
 * is unpaginated and returns every match (an empty term matches all, via the
 * controller's `title || ""`), so it is the only call that can answer
 * "everything I sell" correctly. It requires a session, which a seller has.
 */
export function useMyProducts(sellerId: string | undefined) {
    return useQuery<Product[], ApiError>({
        queryKey: queryKeys.products.mine(sellerId ?? ""),
        queryFn: async () => {
            const all = await searchProducts("");
            return all.filter((product) => product.seller?.id === sellerId);
        },
        enabled: Boolean(sellerId),
    });
}

function useProductInvalidation() {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.search.all });
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
