import type { ApiCategory, Category } from "@/types/category.types";
import type { ApiOrder, Order } from "@/types/order.types";
import type { ApiProduct, Product, ProductSeller } from "@/types/product.types";
import type { ApiReview, Review } from "@/types/review.types";
import type { ApiSellerOrder, SellerOrder } from "@/types/seller.types";
import type { ApiUser } from "@/types/user.types";

/**
 * Adapters between the backend documents and the flat shapes the UI renders.
 *
 * Two things make this layer necessary rather than cosmetic:
 *   - Product fields live under `universal.*` while every payload is flat.
 *   - A review's rating and its text live in two different collections.
 *
 * Populated references can also be a raw id string (or `null` for a dangling
 * ref), so each mapper narrows that union once instead of at every call site.
 */

function isPopulated<T extends { _id: string }>(
    value: T | string | null | undefined,
): value is T {
    return typeof value === "object" && value !== null && "_id" in value;
}

export function mapCategory(input: ApiCategory): Category {
    const parent = isPopulated<ApiCategory>(input.parentCategory)
        ? { id: input.parentCategory._id, name: input.parentCategory.name }
        : null;

    return {
        id: input._id,
        name: input.name,
        description: input.description,
        imageUrl: input.image?.url ?? null,
        isActive: input.isActive,
        parent,
        allowedAttributes: input.allowedAttributes ?? [],
        createdAt: input.createdAt,
    };
}

function mapSeller(input: ApiProduct["universal"]["sellerId"]): ProductSeller | null {
    if (!isPopulated<ApiUser>(input)) return null;
    return { id: input._id, fullname: input.fullname, role: input.role };
}

export function mapProduct(input: ApiProduct): Product {
    const { universal } = input;

    return {
        id: input._id,
        title: universal.title,
        description: universal.description,
        price: universal.price,
        stock: universal.stock,
        images: (universal.images ?? [])
            .map((image) => image.url)
            .filter((url): url is string => Boolean(url)),
        category: isPopulated<ApiCategory>(universal.category)
            ? mapCategory(universal.category)
            : null,
        categoryId: isPopulated<ApiCategory>(universal.category)
            ? universal.category._id
            : typeof universal.category === "string"
                ? universal.category
                : null,
        seller: mapSeller(universal.sellerId),
        reviewsCount: universal.reviewsCount ?? 0,
        // `attributes` is `Mixed`, so a legacy document can hold a non-object value.
        attributes:
            input.attributes && typeof input.attributes === "object"
                ? input.attributes
                : {},
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

export function mapReview(input: ApiReview): Review {
    const author = isPopulated<ApiUser>(input.authorId)
        ? { id: input.authorId._id, fullname: input.authorId.fullname }
        : null;

    const content =
        typeof input.commentId === "object" && input.commentId !== null
            ? input.commentId.content
            : "";

    return {
        id: input._id,
        productId: input.productId,
        rating: input.rating,
        content,
        author,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

export function mapOrder(input: ApiOrder): Order {
    return {
        id: input._id,
        userId: input.userId,
        shipping: input.userInfo,
        items: (input.products ?? []).map((item) => ({
            productId: item.productId,
            sellerId: item.sellerId,
            quantity: item.quantity,
            itemTotal: item.itemTotal,
        })),
        totalAmount: input.totalAmount,
        status: input.status,
        paymentId: input.paymentId,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

/**
 * `GET /seller/orders` — the aggregate hands back only the caller's own lines,
 * so the seller's share is summed here rather than read off `totalAmount`,
 * which still covers every seller in the order.
 */
export function mapSellerOrder(input: ApiSellerOrder): SellerOrder {
    const items = (input.products ?? []).map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        quantity: item.quantity,
        itemTotal: item.itemTotal,
    }));

    return {
        id: input._id,
        buyerId: input.userId,
        shipping: input.userInfo,
        items,
        orderTotal: input.totalAmount,
        sellerSubtotal: items.reduce((sum, item) => sum + item.itemTotal, 0),
        units: items.reduce((sum, item) => sum + item.quantity, 0),
        status: input.status,
        createdAt: input.createdAt,
        updatedAt: input.updatedAt,
    };
}

/**
 * `GET /users` returns users with `.lean()` and no populate, so `activeBan`
 * arrives as a bare id — which is exactly what `POST /admin/unban/:userId/:banId`
 * needs. This is the only way to learn a user's active ban id.
 */
export function getActiveBanId(user: ApiUser): string | null {
    const ban = user.moderation?.activeBan;
    if (!ban) return null;
    return typeof ban === "string" ? ban : ban._id;
}
