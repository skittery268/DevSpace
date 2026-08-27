import type { ApiCategory, ApiImage, Category } from "./category.types";
import type { ApiUser, Role } from "./user.types";

/**
 * server/models/product.model.js
 *
 * Every field except `attributes` lives under `universal`. The Zod schemas and
 * the multipart payloads are flat — the controller is what nests them.
 */
export interface ApiProduct {
    _id: string;
    universal: {
        title: string;
        description: string;
        price: number;
        stock: number;
        images: ApiImage[];
        /** Populated on every read path; `null` if the category was deleted. */
        category: ApiCategory | string | null;
        /** Populated on every read path; `null` if the seller was hard-removed. */
        sellerId: ApiUser | string | null;
        /** Denormalized counter maintained by the review controller. */
        reviewsCount: number;
    };
    /** `Mixed` in Mongo, but the validator only accepts `Record<string, string>`. */
    attributes?: Record<string, string> | null;
    createdAt: string;
    updatedAt: string;
}

export interface ProductSeller {
    id: string;
    fullname: string;
    role: Role;
}

/** Flattened view model produced by lib/mappers.ts. */
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
    category: Category | null;
    /**
     * The category's id even when the reference was not populated.
     *
     * `GET /seller/products` reads with `.lean()` and no populate, so `category`
     * is `null` there while the id is still known — keeping it lets that view
     * resolve the name from the cached category list instead of losing it.
     */
    categoryId: string | null;
    seller: ProductSeller | null;
    reviewsCount: number;
    attributes: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductPayload {
    categoryId: string;
    title: string;
    description: string;
    price: number;
    stock: number;
    attributes?: Record<string, string>;
    /** `upload.array("images", 5)` — at most five files per request. */
    images?: File[];
}

export interface UpdateProductPayload {
    productId: string;
    title?: string;
    description?: string;
    price?: number;
    stock?: number;
    attributes?: Record<string, string>;
    /** Sending any file replaces the whole image array on the server. */
    images?: File[];
}

export const MAX_PRODUCT_IMAGES = 5;
