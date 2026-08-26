import { api } from "./api";

import { mapCategory, mapProduct } from "@/lib/mappers";
import type { ApiEnvelope } from "@/types/api.types";
import type { ApiCategory, Category } from "@/types/category.types";
import type { ApiProduct, Product } from "@/types/product.types";
import type { ApiUser } from "@/types/user.types";

/**
 * `/api/v1/search/*` — every route requires a session.
 *
 * All three are unpaginated: they return every match in a single response and
 * report the size as `results` instead of a count field.
 */

type SearchBody<TKey extends string, TValue> = ApiEnvelope<Record<TKey, TValue[]>> & {
    results: number;
};

/** `GET /search/products?title=` — signed in and not banned. */
export async function searchProducts(term: string): Promise<Product[]> {
    const { data } = await api.get<SearchBody<"products", ApiProduct>>(
        "/search/products",
        { params: { title: term } },
    );
    return data.data.products.map(mapProduct);
}

/**
 * `GET /search/categories?name=` — signed in and not banned.
 *
 * The controller has no `|| ""` fallback, so an absent `name` builds an invalid
 * Mongo query and answers 500. The parameter is therefore always sent.
 */
export async function searchCategories(term: string): Promise<Category[]> {
    const { data } = await api.get<SearchBody<"categories", ApiCategory>>(
        "/search/categories",
        { params: { name: term } },
    );
    return data.data.categories.map(mapCategory);
}

/** `GET /search/users?fullname=` — admin only. */
export async function searchUsers(term: string): Promise<ApiUser[]> {
    const { data } = await api.get<SearchBody<"users", ApiUser>>("/search/users", {
        params: { fullname: term },
    });
    return data.data.users;
}
