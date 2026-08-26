import { api, toPageParams } from "./api";

import { mapProduct } from "@/lib/mappers";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { pageCount } from "@/lib/utils";
import type { ApiEnvelope, Paginated, PaginationParams } from "@/types/api.types";
import type {
    ApiProduct,
    CreateProductPayload,
    Product,
    UpdateProductPayload,
} from "@/types/product.types";

type ProductListBody = ApiEnvelope<{ products: ApiProduct[] }> & {
    productCount: number;
};

function toPaginated(
    body: ProductListBody,
    page: number,
    limit: number,
): Paginated<Product> {
    return {
        items: body.data.products.map(mapProduct),
        total: body.productCount,
        page,
        limit,
        pageCount: pageCount(body.productCount, limit),
    };
}

/** `GET /product` — public, paginated, newest first. */
export async function getProducts({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
}: PaginationParams = {}): Promise<Paginated<Product>> {
    const { data } = await api.get<ProductListBody>("/product", {
        params: toPageParams(page, limit),
    });
    return toPaginated(data, page, limit);
}

/** `GET /product/category/:categoryId` — public, paginated. */
export async function getProductsByCategory(
    categoryId: string,
    { page = 1, limit = DEFAULT_PAGE_SIZE }: PaginationParams = {},
): Promise<Paginated<Product>> {
    const { data } = await api.get<ProductListBody>(
        `/product/category/${categoryId}`,
        { params: toPageParams(page, limit) },
    );
    return toPaginated(data, page, limit);
}

/** `GET /product/:productId` — public. */
export async function getProduct(productId: string): Promise<Product> {
    const { data } = await api.get<ApiEnvelope<{ product: ApiProduct }>>(
        `/product/${productId}`,
    );
    return mapProduct(data.data.product);
}

/**
 * Builds the multipart body shared by create and edit.
 *
 * `parseFields` JSON-parses `attributes`, `price` and `stock` before Zod sees
 * them, so those three fields must be valid JSON literals — a bare `"abc"`
 * throws inside the middleware and surfaces as a 500.
 */
function toProductFormData(
    input: Partial<Omit<CreateProductPayload, "categoryId">>,
): FormData {
    const form = new FormData();

    if (input.title !== undefined) form.append("title", input.title);
    if (input.description !== undefined) form.append("description", input.description);
    if (input.price !== undefined) form.append("price", JSON.stringify(input.price));
    if (input.stock !== undefined) form.append("stock", JSON.stringify(input.stock));
    if (input.attributes !== undefined) {
        form.append("attributes", JSON.stringify(input.attributes));
    }

    for (const file of input.images ?? []) {
        form.append("images", file);
    }

    return form;
}

/**
 * `POST /product/createproduct/:categoryId` — seller or admin, multipart.
 * The controller rejects attribute keys that are not in the category's
 * `allowedAttributes`, and refuses inactive categories.
 */
export async function createProduct({
    categoryId,
    ...rest
}: CreateProductPayload): Promise<Product> {
    const { data } = await api.post<ApiEnvelope<{ product: ApiProduct }>>(
        `/product/createproduct/${categoryId}`,
        toProductFormData(rest),
    );
    return mapProduct(data.data.product);
}

/**
 * `PATCH /product/editproduct/:productId` — owning seller only.
 * Sending any file replaces the entire image array and destroys the old
 * Cloudinary assets, so partial image edits are not possible.
 */
export async function updateProduct({
    productId,
    ...rest
}: UpdateProductPayload): Promise<Product> {
    const { data } = await api.patch<ApiEnvelope<{ product: ApiProduct }>>(
        `/product/editproduct/${productId}`,
        toProductFormData(rest),
    );
    return mapProduct(data.data.product);
}

/** `DELETE /product/deleteproduct/:productId` — owner, admin or moderator. */
export async function deleteProduct(productId: string): Promise<void> {
    await api.delete(`/product/deleteproduct/${productId}`);
}
