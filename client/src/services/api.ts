import axios from "axios";

import { normalizeError } from "@/lib/api-error";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local and point it at the DevSpace backend.",
    );
}

/**
 * The single Axios instance for the whole app.
 *
 * The backend authenticates with an httpOnly `at` cookie (see
 * `middlewares/auth.middleware.js` — it reads `req.cookies.at` and never looks
 * at an Authorization header), so `withCredentials` is mandatory and there is
 * no token to attach, store or refresh on the client.
 */
export const api = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 30_000,
});

// Every rejection leaves this layer as an ApiError, so no component ever has to
// unwrap an AxiosError.
api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(normalizeError(error)),
);

/**
 * Full-page redirect target for Google OAuth.
 * Passport responds with a 302 to Google, which XHR cannot follow, so this flow
 * has to leave Axios entirely.
 */
export function getGoogleAuthUrl(): string {
    const serverUrl =
        process.env.NEXT_PUBLIC_SERVER_URL ?? baseURL!.replace(/\/api\/v1\/?$/, "");
    return `${serverUrl}/api/v1/auth/google`;
}

/**
 * Both list controllers do `Number(req.query.page)` without any integer check,
 * and MongoDB rejects fractional `skip`/`limit` with a server error. Clamping
 * here keeps a stray value from turning into a 500.
 */
export function toPageParams(page?: number, limit?: number) {
    const params: Record<string, number> = {};
    if (page !== undefined) params.page = Math.max(1, Math.trunc(page) || 1);
    if (limit !== undefined) {
        params.limit = Math.min(100, Math.max(1, Math.trunc(limit) || 12));
    }
    return params;
}
