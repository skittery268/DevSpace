import { AxiosError } from "axios";
import type { TFunction } from "i18next";

import type { ApiErrorBody, ApiValidationErrorBody } from "@/types/api.types";

/**
 * The client-side fallbacks, as translation keys.
 *
 * A message the backend sent is passed through untouched — it is data, and the
 * API speaks one language. Everything the *client* invents about a failure is
 * a key instead, so it reaches the user in the language they are reading.
 */
type ErrorKey =
    | "errors.generic"
    | "errors.timeout"
    | "errors.network"
    | "errors.validationFailed"
    | "errors.requestFailed"
    | "errors.unauthorized"
    | "errors.forbidden"
    | "errors.notFound"
    | "errors.conflict"
    | "errors.tooLarge"
    | "errors.server";

export interface ErrorTranslation {
    key: ErrorKey;
    params?: Record<string, string | number>;
}

/**
 * Field-level errors are keyed by the `field` string the backend sends.
 * Object-level Zod issues arrive with an empty path, so they are collected
 * under this key instead of silently disappearing.
 */
export const FORM_ERROR_KEY = "_form";

/**
 * The single error type the rest of the app deals with.
 *
 * The backend produces two different error shapes and the UI must never have to
 * know that:
 *   - `{ status, message }`                       — utils/appError.util.js
 *   - `{ status, message, errors: [{field,...}] }` — middlewares/validate.middleware.js
 */
export class ApiError extends Error {
    readonly status?: number;
    readonly fieldErrors?: Record<string, string>;
    readonly isNetworkError: boolean;
    /**
     * Set when `message` is a client-side fallback rather than something the
     * server said. `resolveErrorMessage` prefers it, so the same failure reads in
     * whichever language the page is in.
     */
    readonly translation?: ErrorTranslation;

    constructor(
        message: string,
        options: {
            status?: number;
            fieldErrors?: Record<string, string>;
            isNetworkError?: boolean;
            translation?: ErrorTranslation;
        } = {},
    ) {
        super(message);
        this.name = "ApiError";
        this.status = options.status;
        this.fieldErrors = options.fieldErrors;
        this.isNetworkError = options.isNetworkError ?? false;
        this.translation = options.translation;
    }

    /** 401 from `protect`: no cookie, expired token, unverified or deleted account. */
    get isUnauthorized(): boolean {
        return this.status === 401;
    }

    /** 403 from `allowedTo`, `checkBan` or an ownership check inside a controller. */
    get isForbidden(): boolean {
        return this.status === 403;
    }

    get isNotFound(): boolean {
        return this.status === 404;
    }
}

function isValidationBody(body: unknown): body is ApiValidationErrorBody {
    return (
        typeof body === "object" &&
        body !== null &&
        Array.isArray((body as ApiValidationErrorBody).errors)
    );
}

function isErrorBody(body: unknown): body is ApiErrorBody {
    return (
        typeof body === "object" &&
        body !== null &&
        typeof (body as ApiErrorBody).message === "string"
    );
}

/** English stays as the untranslated fallback for logs and error boundaries. */
const STATUS_FALLBACKS: Record<number, { message: string; key: ErrorKey }> = {
    401: { message: "You need to sign in to continue.", key: "errors.unauthorized" },
    403: {
        message: "You do not have permission to do this.",
        key: "errors.forbidden",
    },
    404: { message: "The requested resource was not found.", key: "errors.notFound" },
    409: {
        message: "This action conflicts with the current state of the data.",
        key: "errors.conflict",
    },
    413: { message: "The uploaded files are too large.", key: "errors.tooLarge" },
    500: {
        message: "The server ran into a problem. Please try again.",
        key: "errors.server",
    },
};

/**
 * Turns anything thrown by Axios into an `ApiError`.
 * Installed as a response interceptor, so callers only ever see `ApiError`.
 */
export function normalizeError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;

    if (error instanceof AxiosError) {
        if (!error.response) {
            const aborted = error.code === "ECONNABORTED" || error.code === "ERR_CANCELED";
            return new ApiError(
                aborted
                    ? "The request took too long and was cancelled."
                    : "Cannot reach the server. Check your connection and try again.",
                {
                    isNetworkError: true,
                    translation: { key: aborted ? "errors.timeout" : "errors.network" },
                },
            );
        }

        const { status, data } = error.response;

        if (isValidationBody(data)) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of data.errors) {
                const key = issue.field || FORM_ERROR_KEY;
                // Keep the first message per field: it is the most specific one.
                if (!fieldErrors[key]) fieldErrors[key] = issue.message;
            }
            return new ApiError(data.message || "Validation failed.", {
                status,
                fieldErrors,
                // Only the generic fallback is ours to translate; a message the
                // validator wrote is the server's own words.
                ...(data.message ? {} : { translation: { key: "errors.validationFailed" as const } }),
            });
        }

        if (isErrorBody(data)) {
            return new ApiError(data.message, { status });
        }

        const fallback = STATUS_FALLBACKS[status];
        return new ApiError(
            fallback?.message ?? `Request failed with status ${status}.`,
            {
                status,
                translation: fallback
                    ? { key: fallback.key }
                    : { key: "errors.requestFailed", params: { status } },
            },
        );
    }

    if (error instanceof Error) return new ApiError(error.message);

    return new ApiError("Something went wrong.", {
        translation: { key: "errors.generic" },
    });
}

/**
 * The message to actually show someone: the translated fallback when the
 * client produced it, and the server's own words when it did not.
 */
export function resolveErrorMessage(error: unknown, t: TFunction): string {
    const normalized = normalizeError(error);
    return normalized.translation
        ? t(normalized.translation.key, normalized.translation.params)
        : normalized.message;
}
