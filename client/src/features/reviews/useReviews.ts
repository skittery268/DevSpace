"use client";

import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { ApiError } from "@/lib/api-error";
import { queryKeys } from "@/lib/query-keys";
import * as reviewService from "@/services/review.service";
import type { Paginated } from "@/types/api.types";
import type {
    CreateReviewPayload,
    Review,
    UpdateReviewPayload,
} from "@/types/review.types";

export function useProductReviews(productId: string, page: number, limit = 10) {
    return useQuery<Paginated<Review>, ApiError>({
        queryKey: queryKeys.reviews.byProduct(productId, { page, limit }),
        queryFn: () => reviewService.getProductReviews(productId, { page, limit }),
        enabled: Boolean(productId),
        placeholderData: keepPreviousData,
    });
}

/**
 * Creating or removing a review moves `product.universal.reviewsCount`, so the
 * product detail cache has to be refreshed alongside the review list.
 */
function useReviewInvalidation(productId: string) {
    const queryClient = useQueryClient();
    return () => {
        void queryClient.invalidateQueries({
            queryKey: queryKeys.reviews.ofProduct(productId),
        });
        void queryClient.invalidateQueries({
            queryKey: queryKeys.products.detail(productId),
        });
    };
}

export function useCreateReview(productId: string) {
    const invalidate = useReviewInvalidation(productId);

    return useMutation<Review, ApiError, CreateReviewPayload>({
        mutationFn: reviewService.createReview,
        onSuccess: invalidate,
    });
}

export function useUpdateReview(productId: string) {
    const invalidate = useReviewInvalidation(productId);

    return useMutation<Review, ApiError, UpdateReviewPayload>({
        mutationFn: reviewService.updateReview,
        onSuccess: invalidate,
    });
}

export function useDeleteReview(productId: string) {
    const invalidate = useReviewInvalidation(productId);

    return useMutation<void, ApiError, string>({
        mutationFn: reviewService.deleteReview,
        onSuccess: invalidate,
    });
}
