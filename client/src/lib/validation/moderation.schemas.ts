import type { TFunction } from "i18next";
import { z } from "zod";

/** Mirror of server/validators/adminAction.validator.js. */

const reasonField = (t: TFunction) =>
    z
        .string()
        .trim()
        .min(5, t("validation.reasonMin"))
        .max(500, t("validation.reasonMax"));

/**
 * `expiresAt` is a **number of days**, not a date — the service converts it with
 * `Date.now() + expiresAt * 24 * 60 * 60 * 1000`. Leaving it empty makes the
 * sanction permanent.
 */
export const createSanctionSchema = (t: TFunction) =>
    z.object({
        reason: reasonField(t),
        duration: z
            .union([
                z.literal(""),
                z.coerce.number().int(t("validation.durationWhole")).min(1),
            ])
            .default(""),
    });

export const createRevokeSanctionSchema = (t: TFunction) =>
    z.object({ reason: reasonField(t) });

export type SanctionValues = z.input<ReturnType<typeof createSanctionSchema>>;
export type SanctionOutput = z.output<ReturnType<typeof createSanctionSchema>>;
export type RevokeSanctionValues = z.infer<
    ReturnType<typeof createRevokeSanctionSchema>
>;
