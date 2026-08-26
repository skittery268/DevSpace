import { api, toPageParams } from "./api";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { mapReview } from "@/lib/mappers";
import { pageCount } from "@/lib/utils";
import type { ApiEnvelope, Paginated, PaginationParams } from "@/types/api.types";
import type {
    ApiReview,
    CreateReviewPayload,
    Review,
    UpdateReviewPayload,
} from "@/types/review.types";

/** Note the count key is `reviewsCount`, not `reviewCount`. */
type ReviewListBody = ApiEnvelope<{ reviews: ApiReview[] }> & {
    reviewsCount: number;
};

/** `GET /review/:productId` — public, paginated, author and comment populated. */
export async function getProductReviews(
    productId: string,
    { page = 1, limit = DEFAULT_PAGE_SIZE }: PaginationParams = {},
): Promise<Paginated<Review>> {
    const { data } = await api.get<ReviewListBody>(`/review/${productId}`, {
        params: toPageParams(page, limit),
    });

    return {
        items: data.data.reviews.map(mapReview),
        total: data.reviewsCount,
        page,
        limit,
        pageCount: pageCount(data.reviewsCount, limit),
    };
}

/**
 * `POST /review/:productId` — signed in and not banned.
 * `rating` must be a real number: this schema uses `z.number()`, not `z.coerce`.
 */
export async function createReview({
    productId,
    content,
    rating,
}: CreateReviewPayload): Promise<Review> {
    const { data } = await api.post<ApiEnvelope<{ review: ApiReview }>>(
        `/review/${productId}`,
        { content, rating },
    );
    return mapReview(data.data.review);
}

/** `PATCH /review/:reviewId` — author only. */
export async function updateReview({
    reviewId,
    ...body
}: UpdateReviewPayload): Promise<Review> {
    const { data } = await api.patch<ApiEnvelope<{ review: ApiReview }>>(
        `/review/${reviewId}`,
        body,
    );
    return mapReview(data.data.review);
}

/** `DELETE /review/:reviewId` — author, admin or moderator. */
export async function deleteReview(reviewId: string): Promise<void> {
    await api.delete(`/review/${reviewId}`);
}
