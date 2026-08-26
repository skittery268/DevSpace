import type { ApiUser } from "./user.types";

/**
 * server/models/comment.model.js
 *
 * A review's *text* lives in its own collection. `Comment` has no routes of its
 * own: it is created, edited and deleted only through the review controller.
 */
export interface ApiComment {
    _id: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * server/models/review.model.js
 *
 * `authorId` and `commentId` are populated by every review endpoint, but a
 * dangling reference resolves to `null`.
 */
export interface ApiReview {
    _id: string;
    authorId: ApiUser | string | null;
    productId: string;
    commentId: ApiComment | string | null;
    rating: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Flattened view model: the Review/Comment split is an implementation detail of
 * the backend and is collapsed here so the UI deals with one object.
 */
export interface Review {
    id: string;
    productId: string;
    rating: number;
    content: string;
    author: { id: string; fullname: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateReviewPayload {
    productId: string;
    content: string;
    rating: number;
}

export interface UpdateReviewPayload {
    reviewId: string;
    content?: string;
    rating?: number;
}
