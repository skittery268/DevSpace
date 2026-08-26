/** server/models/category.model.js */

export interface ApiImage {
    url?: string;
    public_id?: string;
    _id?: string;
}

export interface ApiCategory {
    _id: string;
    name: string;
    description: string;
    image?: ApiImage;
    /** Read by createProduct, but no endpoint can write it — always true in practice. */
    isActive: boolean;
    /**
     * Populated one level deep by `getCategories` / `searchCategories`, but the
     * referenced document may have been removed, so it can be `null`.
     */
    parentCategory: ApiCategory | string | null;
    allowedAttributes: string[];
    createdAt: string;
    updatedAt: string;
}

/** Flattened view model produced by lib/mappers.ts. */
export interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl: string | null;
    isActive: boolean;
    parent: { id: string; name: string } | null;
    allowedAttributes: string[];
    createdAt: string;
}

export interface CreateCategoryPayload {
    name: string;
    description: string;
    allowedAttributes: string[];
    parentCategory?: string;
    /** Required by the controller (`if (!file) → 400`), even though Zod does not see it. */
    image: File;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    allowedAttributes?: string[];
    parentCategory?: string;
    image?: File;
}
