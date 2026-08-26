import type { TFunction } from "i18next";
import { z } from "zod";

import { SIX_DIGIT_CODE } from "@/lib/constants";

/**
 * Mirrors of server/validators/auth.validator.js.
 *
 * These exist for immediate feedback only — the backend revalidates everything
 * and its errors are surfaced through `ApiError.fieldErrors`.
 *
 * Every schema is a factory over `t` rather than a module constant: the message
 * a rule produces is interface copy, and interface copy has to be able to
 * change language without a reload. Components build theirs with `useMemo`, so
 * a schema is rebuilt only when the language actually changes.
 *
 * Two rules are stricter than the server's on purpose:
 *   - codes must be exactly six digits, because `otplib` v13 *throws* on a
 *     malformed token (which surfaces as a 500) instead of reporting it invalid;
 *   - passwords are capped at 72 characters, the point past which bcrypt
 *     silently ignores the rest.
 */

const emailField = (t: TFunction) =>
    z
        .string()
        .trim()
        .min(1, t("validation.emailRequired"))
        .email(t("validation.emailInvalid"))
        .toLowerCase();

const passwordField = (t: TFunction) =>
    z
        .string()
        .min(8, t("validation.passwordMin"))
        .max(72, t("validation.passwordMax"));

const codeField = (t: TFunction) =>
    z.string().trim().regex(SIX_DIGIT_CODE, t("validation.codeSixDigits"));

export const createRegisterSchema = (t: TFunction) =>
    z.object({
        fullname: z
            .string()
            .trim()
            .min(5, t("validation.fullNameMin"))
            .max(50, t("validation.fullNameMax")),
        email: emailField(t),
        password: passwordField(t),
    });

export const createLoginSchema = (t: TFunction) =>
    z.object({ email: emailField(t), password: passwordField(t) });

export const createForgotPasswordSchema = (t: TFunction) =>
    z.object({ email: emailField(t) });

export const createResetPasswordSchema = (t: TFunction) =>
    z.object({
        email: emailField(t),
        code: codeField(t),
        newPassword: passwordField(t),
    });

export const createTwoFactorCodeSchema = (t: TFunction) =>
    z.object({ code: codeField(t) });

export const createPasswordConfirmSchema = (t: TFunction) =>
    z.object({ password: passwordField(t) });

export type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;
export type LoginValues = z.infer<ReturnType<typeof createLoginSchema>>;
export type ForgotPasswordValues = z.infer<
    ReturnType<typeof createForgotPasswordSchema>
>;
export type ResetPasswordValues = z.infer<
    ReturnType<typeof createResetPasswordSchema>
>;
export type TwoFactorCodeValues = z.infer<
    ReturnType<typeof createTwoFactorCodeSchema>
>;
export type PasswordConfirmValues = z.infer<
    ReturnType<typeof createPasswordConfirmSchema>
>;
