import type { TFunction } from "i18next";
import { z } from "zod";

/** Mirror of `createCheckoutSessionSchema.userInfo` in server/validators/payment.validator.js. */
export const createShippingSchema = (t: TFunction) =>
    z.object({
        fullname: z
            .string()
            .trim()
            .min(5, t("validation.fullNameMin"))
            .max(50, t("validation.fullNameMax")),
        email: z
            .string()
            .trim()
            .min(3, t("validation.emailMin"))
            .email(t("validation.emailInvalid"))
            .toLowerCase(),
        country: z.string().trim().min(1, t("validation.countryRequired")),
        city: z.string().trim().min(1, t("validation.cityRequired")),
        address: z.string().trim().min(1, t("validation.addressRequired")),
        zipcode: z.string().trim().min(1, t("validation.zipcodeRequired")),
        phone: z.string().trim().min(1, t("validation.phoneRequired")),
    });

export type ShippingValues = z.infer<ReturnType<typeof createShippingSchema>>;
