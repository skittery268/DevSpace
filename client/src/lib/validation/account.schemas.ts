import type { TFunction } from "i18next";
import { z } from "zod";

import { SIX_DIGIT_CODE } from "@/lib/constants";

/**
 * Mirrors of server/validators/user.validator.js.
 *
 * As everywhere else in lib/validation, these are factories over `t` so a rule's
 * message follows the interface language, and they only ever produce immediate
 * feedback — the backend revalidates and its messages come back through
 * `ApiError.fieldErrors`.
 */

export const createFullnameSchema = (t: TFunction) =>
    z.object({
        fullname: z
            .string()
            .trim()
            .min(5, t("validation.fullNameMin"))
            .max(50, t("validation.fullNameMax")),
    });

/**
 * `editUserEmailSchema` is `.strict()`, so the request body must carry exactly
 * `email`, `code`, `password` and `newEmail` — `email` being the address the
 * account has *now*, which the form fills in from the session rather than
 * asking for it again.
 *
 * The extra rule the server does not have: the new address must differ from the
 * current one. The controller would otherwise look it up, find the account
 * itself, and answer 409 "Unable to update email", which reads like a mistake
 * on someone else's part.
 */
export const createChangeEmailSchema = (t: TFunction, currentEmail: string) =>
    z.object({
        newEmail: z
            .string()
            .trim()
            .min(1, t("validation.emailRequired"))
            .email(t("validation.emailInvalid"))
            .toLowerCase()
            .refine(
                (value) => value !== currentEmail.trim().toLowerCase(),
                t("validation.emailSameAsCurrent"),
            ),
        code: z.string().trim().regex(SIX_DIGIT_CODE, t("validation.codeSixDigits")),
        password: z
            .string()
            .min(8, t("validation.passwordMin"))
            .max(72, t("validation.passwordMax")),
    });

export type FullnameValues = z.infer<ReturnType<typeof createFullnameSchema>>;
export type ChangeEmailValues = z.infer<ReturnType<typeof createChangeEmailSchema>>;
