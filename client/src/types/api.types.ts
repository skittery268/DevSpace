/**
 * Response envelopes used by the DevSpace backend.
 *
 * Success responses are always `{ status, message, data: { <resource> } }`,
 * list endpoints add a count field whose *name changes per resource*
 * (`productCount`, `categoryCount`, `orderCount`, `userCount`, `reviewsCount`)
 * and search endpoints use `results` instead.
 * See server/controllers/*.controller.js.
 */

export interface ApiEnvelope<TData> {
    status: "success";
    message: string;
    data: TData;
}

/** `{ status, message }` — the shape produced by utils/appError.util.js. */
export interface ApiErrorBody {
    status: "fail" | "error";
    message: string;
}

/**
 * The only endpoint shape carrying an `errors` array: it is written directly by
 * middlewares/validate.middleware.js and never reaches the global error handler.
 */
export interface ApiValidationErrorBody {
    status: "fail";
    message: string;
    errors: Array<{ field: string; message: string }>;
}

/** Query string accepted by every paginated list controller. */
export interface PaginationParams {
    page?: number;
    limit?: number;
}

/** Normalized list result produced by the service layer. */
export interface Paginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    pageCount: number;
}
