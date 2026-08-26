import { api } from "./api";

import type { ApiEnvelope } from "@/types/api.types";
import type { ApiUser } from "@/types/user.types";

/** All endpoints below live under `/api/v1/auth` (server/routers/auth.router.js). */

export interface RegisterInput {
    fullname: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

/**
 * `POST /auth/login` answers with one of two bodies:
 *   - `{ status, message, data: { user } }` and an `at` session cookie, or
 *   - `{ status, requires2FA: true }` and a short-lived `twoFA` cookie.
 */
export type LoginResponse =
    | { requires2FA: true; user: null }
    | { requires2FA: false; user: ApiUser };

type LoginBody =
    | { status: "success"; requires2FA: true }
    | ApiEnvelope<{ user: ApiUser }>;

export async function register(input: RegisterInput): Promise<string> {
    // 201 with no cookie — the account stays unusable until the emailed link is opened.
    const { data } = await api.post<{ status: "success"; message: string }>(
        "/auth/register",
        input,
    );
    return data.message;
}

export async function login(input: LoginInput): Promise<LoginResponse> {
    const { data } = await api.post<LoginBody>("/auth/login", input);

    if ("requires2FA" in data && data.requires2FA) {
        return { requires2FA: true, user: null };
    }

    return { requires2FA: false, user: (data as ApiEnvelope<{ user: ApiUser }>).data.user };
}

export async function logout(): Promise<void> {
    // The route is DELETE, not POST.
    await api.delete("/auth/logout");
}

export async function getMe(): Promise<ApiUser> {
    const { data } = await api.get<ApiEnvelope<{ user: ApiUser }>>("/auth/me");
    return data.data.user;
}

export async function forgotPassword(email: string): Promise<string> {
    // Always 200, whether or not the address exists (no user enumeration).
    const { data } = await api.post<{ status: "success"; message: string }>(
        "/auth/forgot-password",
        { email },
    );
    return data.message;
}

export interface ResetPasswordInput {
    email: string;
    /** The six-digit code mailed by `sendResetPasswordCode`. */
    code: string;
    newPassword: string;
}

export async function resetPassword(input: ResetPasswordInput): Promise<string> {
    const { data } = await api.post<{ status: "success"; message: string }>(
        "/auth/reset-password",
        input,
    );
    return data.message;
}

/* -------------------------------------------------------------------------- */
/* Two-factor authentication                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `POST /auth/2fa/setup` returns the QR code at the *top level*, not inside
 * `data`, unlike every other endpoint in the app.
 */
export async function setup2FA(password: string): Promise<string> {
    const { data } = await api.post<{ status: "success"; qrcode: string }>(
        "/auth/2fa/setup",
        { password },
    );
    return data.qrcode;
}

export async function verify2FASetup(code: string): Promise<string> {
    const { data } = await api.post<{ status: "success"; message: string }>(
        "/auth/2fa/verify-setup",
        { code },
    );
    return data.message;
}

/**
 * `POST /auth/2fa/verify-login` runs without `protect`: it authenticates using
 * the `twoFA` cookie set by the password step and issues the real session.
 */
export async function verify2FALogin(code: string): Promise<ApiUser> {
    const { data } = await api.post<ApiEnvelope<{ user: ApiUser }>>(
        "/auth/2fa/verify-login",
        { code },
    );
    return data.data.user;
}

export async function disable2FA(password: string): Promise<string> {
    const { data } = await api.post<{ status: "success"; message: string }>(
        "/auth/2fa/disable",
        { password },
    );
    return data.message;
}
