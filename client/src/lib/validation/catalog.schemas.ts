import type { TFunction } from "i18next";
import { z } from "zod";

import { MAX_PRODUCT_IMAGES } from "@/types/product.types";

/** Mirrors of server/validators/product.validator.js and category.validator.js. */

const objectId = (t: TFunction) =>
    z.string().regex(/^[0-9a-fA-F]{24}$/, t("validation.invalidId"));

/**
 * Attribute values and a category's `allowedAttributes` are edited with custom
 * controls whose shape is driven by the selected category, not by a fixed set
 * of inputs. They are held in component state and folded into the payload on
 * submit, so they stay out of these schemas.
 */
export const createProductFormSchema = (t: TFunction) =>
    z.object({
        title: z
            .string()
            .trim()
            .min(5, t("validation.productTitleMin"))
            .max(100, t("validation.productTitleMax")),
        description: z
            .string()
            .trim()
            .min(10, t("validation.productDescriptionMin"))
            .max(1000, t("validation.productDescriptionMax")),
        price: z.coerce
            .number({ error: t("validation.priceRequired") })
            .positive(t("validation.pricePositive"))
            .min(1, t("validation.priceMin")),
        // The backend rejects a stock of 0 in both the create and the edit schema,
        // so "out of stock" cannot be expressed through the API.
        stock: z.coerce
            .number({ error: t("validation.stockRequired") })
            .int(t("validation.stockWhole"))
            .min(1, t("validation.stockMin")),
    });

export type ProductFormValues = z.input<
    ReturnType<typeof createProductFormSchema>
>;
export type ProductFormOutput = z.output<
    ReturnType<typeof createProductFormSchema>
>;

export const MAX_IMAGES = MAX_PRODUCT_IMAGES;

export const createCategoryFormSchema = (t: TFunction) =>
    z.object({
        name: z
            .string()
            .trim()
            .min(5, t("validation.categoryNameMin"))
            .max(50, t("validation.categoryNameMax")),
        description: z
            .string()
            .trim()
            .min(5, t("validation.categoryDescriptionMin"))
            .max(300, t("validation.categoryDescriptionMax")),
        // The backend validator has no `.nullable()`, so an empty value simply means
        // "leave the parent alone" — a parent can never be cleared through the API.
        parentCategory: z.union([objectId(t), z.literal("")]).default(""),
    });

export type CategoryFormValues = z.input<
    ReturnType<typeof createCategoryFormSchema>
>;
export type CategoryFormOutput = z.output<
    ReturnType<typeof createCategoryFormSchema>
>;

export const createReviewFormSchema = (t: TFunction) =>
    z.object({
        rating: z.coerce
            .number({ error: t("validation.ratingRequired") })
            .int()
            .min(1, t("validation.ratingMin"))
            .max(5, t("validation.ratingMax")),
        content: z
            .string()
            .trim()
            .min(5, t("validation.reviewMin"))
            .max(500, t("validation.reviewMax")),
    });

export type ReviewFormValues = z.input<
    ReturnType<typeof createReviewFormSchema>
>;
export type ReviewFormOutput = z.output<
    ReturnType<typeof createReviewFormSchema>
>;
