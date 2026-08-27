import { api, toPageParams } from "./api";

import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { mapProduct, mapSellerOrder } from "@/lib/mappers";
import { pageCount } from "@/lib/utils";
import type { ApiEnvelope, Paginated, PaginationParams } from "@/types/api.types";
import type { ApiProduct, Product } from "@/types/product.types";
import type { ApiSellerOrder, SellerOrder } from "@/types/seller.types";

/**
 * `/api/v1/seller/*` — `protect, checkBan, allowedTo("seller", "admin", "moderator")`.
 *
 * Both controllers scope their query to `req.user._id`, so these routes answer
 * "what do *I* sell" rather than "show me a seller's shop". Role decides who
 * may ask; ownership decides what comes back. `hasSellerArea` mirrors the role
 * list.
 */

type SellerProductListBody = ApiEnvelope<{ products: ApiProduct[] }> & {
    productCount: number;
};

/**
 * `GET /seller/products` — the caller's own catalog, paginated, newest first.
 *
 * The controller queries with `.lean()` and **no populate**, so `category` and
 * `sellerId` come back as bare ObjectId strings and `mapProduct` resolves both
 * to `null`. That matters beyond a missing label: `canEditProduct` compares
 * `product.seller.id` against the session, so an unhydrated product looks like
 * someone else's and loses its own edit control. `useSellerProducts` fills both
 * back in — see features/seller/useSeller.ts.
 */
export async function getSellerProducts({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
}: PaginationParams = {}): Promise<Paginated<Product>> {
    const { data } = await api.get<SellerProductListBody>("/seller/products", {
        params: toPageParams(page, limit),
    });

    return {
        items: data.data.products.map(mapProduct),
        total: data.productCount,
        page,
        limit,
        pageCount: pageCount(data.productCount, limit),
    };
}

/** Note the count key is `ordersCount` — `/order` spells the same idea `orderCount`. */
type SellerOrderListBody = ApiEnvelope<{ orders: ApiSellerOrder[] }> & {
    ordersCount: number;
};

/**
 * `GET /seller/orders` — every order containing one of the caller's products.
 *
 * The controller runs a `$facet` that paginates and counts in one pass, so this
 * behaves like every other list endpoint. `$facet` always emits exactly one
 * document, including when nothing matched, so an empty result is `{ orders: [],
 * total: [] }` and `ordersCount` is `0` — never a missing field.
 */
export async function getSellerOrders({
    page = 1,
    limit = DEFAULT_PAGE_SIZE,
}: PaginationParams = {}): Promise<Paginated<SellerOrder>> {
    const { data } = await api.get<SellerOrderListBody>("/seller/orders", {
        params: toPageParams(page, limit),
    });

    return {
        items: data.data.orders.map(mapSellerOrder),
        total: data.ordersCount,
        page,
        limit,
        pageCount: pageCount(data.ordersCount, limit),
    };
}
