import { api, toPageParams } from "./api";

import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";
import { mapCategory } from "@/lib/mappers";
import { pageCount } from "@/lib/utils";
import type { ApiEnvelope, Paginated, PaginationParams } from "@/types/api.types";
import type {
    ApiCategory,
    Category,
    CreateCategoryPayload,
    UpdateCategoryPayload,
} from "@/types/category.types";

type CategoryListBody = ApiEnvelope<{ categories: ApiCategory[] }> & {
    categoryCount: number;
};

/** `GET /category` — public, paginated, `parentCategory` populated one level. */
export async function getCategories({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
}: PaginationParams = {}): Promise<Paginated<Category>> {
    const { data } = await api.get<CategoryListBody>("/category", {
        params: toPageParams(page, limit),
    });

    return {
        items: data.data.categories.map(mapCategory),
        total: data.categoryCount,
        page,
        limit,
        pageCount: pageCount(data.categoryCount, limit),
    };
}

/**
 * There is no `GET /category/:id`, so a single category is read out of the
 * paginated list. The backend caps `limit` at 100; catalogs larger than that
 * are walked page by page.
 */
export async function findCategoryById(categoryId: string): Promise<Category | null> {
    let page = 1;

    for (;;) {
        const result = await getCategories({ page, limit: MAX_PAGE_SIZE });
        const match = result.items.find((category) => category.id === categoryId);
        if (match) return match;
        if (page >= result.pageCount || result.items.length === 0) return null;
        page += 1;
    }
}

/** Every category is fetched, for parent pickers and attribute lookups. */
export async function getAllCategories(): Promise<Category[]> {
    const all: Category[] = [];
    let page = 1;

    for (;;) {
        const result = await getCategories({ page, limit: MAX_PAGE_SIZE });
        all.push(...result.items);
        if (page >= result.pageCount || result.items.length === 0) break;
        page += 1;
    }

    return all;
}

function toCategoryFormData(input: UpdateCategoryPayload): FormData {
    const form = new FormData();

    if (input.name !== undefined) form.append("name", input.name);
    if (input.description !== undefined) form.append("description", input.description);
    // `parseFields` JSON-parses this one before Zod validates it as a string array.
    if (input.allowedAttributes !== undefined) {
        form.append("allowedAttributes", JSON.stringify(input.allowedAttributes));
    }
    // The validator has no `.nullable()`, so a parent can be set but never cleared.
    if (input.parentCategory) form.append("parentCategory", input.parentCategory);
    if (input.image) form.append("image", input.image);

    return form;
}

/** `POST /category/createcategory` — admin or moderator, image required. */
export async function createCategory(
    input: CreateCategoryPayload,
): Promise<Category> {
    const { data } = await api.post<ApiEnvelope<{ category: ApiCategory }>>(
        "/category/createcategory",
        toCategoryFormData(input),
    );
    return mapCategory(data.data.category);
}

/** `PATCH /category/editcategory/:id` — admin or moderator. */
export async function updateCategory(
    categoryId: string,
    input: UpdateCategoryPayload,
): Promise<Category> {
    const { data } = await api.patch<ApiEnvelope<{ category: ApiCategory }>>(
        `/category/editcategory/${categoryId}`,
        toCategoryFormData(input),
    );
    return mapCategory(data.data.category);
}

/**
 * `DELETE /category/deletecategory/:id` — admin or moderator.
 * Answers 409 when the category still has child categories or products.
 */
export async function deleteCategory(categoryId: string): Promise<void> {
    await api.delete(`/category/deletecategory/${categoryId}`);
}
