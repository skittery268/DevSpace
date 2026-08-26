import type { Order } from "@/types/order.types";
import type { Product } from "@/types/product.types";
import type { Review } from "@/types/review.types";
import type { ApiUser, Role } from "@/types/user.types";

/**
 * UI-only mirrors of the backend's role gates and ownership checks.
 *
 * These exist so the interface never offers an action the server would reject.
 * They are **not** a security layer: `allowedTo(...)` and the ownership
 * comparisons inside the controllers remain the only real authorization.
 *
 * The rules below are deliberately non-uniform because the backend's are —
 * for example a moderator may delete a product but cannot edit one, since
 * `productRouter.use(..., allowedTo("seller", "admin"))` shuts them out of the
 * edit route before the controller is ever reached.
 */

type Actor = Pick<ApiUser, "_id" | "role"> | null | undefined;

export function hasRole(user: Actor, ...roles: Role[]): boolean {
    return Boolean(user && roles.includes(user.role));
}

export function isSelf(user: Actor, otherUserId: string | null | undefined): boolean {
    return Boolean(user && otherUserId && user._id === otherUserId);
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

/** `POST /product/createproduct/:categoryId` — allowedTo("seller", "admin"). */
export function canCreateProduct(user: Actor): boolean {
    return hasRole(user, "seller", "admin");
}

/**
 * `PATCH /product/editproduct/:productId` — the route allows seller and admin,
 * but the controller then requires `sellerId === req.user._id` with no admin
 * exception, so only the owning seller can actually succeed.
 */
export function canEditProduct(user: Actor, product: Pick<Product, "seller">): boolean {
    return hasRole(user, "seller", "admin") && isSelf(user, product.seller?.id);
}

/**
 * `DELETE /product/deleteproduct/:productId` — the route allows seller,
 * moderator and admin; the controller allows the owner, an admin or a moderator.
 */
export function canDeleteProduct(
    user: Actor,
    product: Pick<Product, "seller">,
): boolean {
    if (hasRole(user, "admin", "moderator")) return true;
    return hasRole(user, "seller") && isSelf(user, product.seller?.id);
}

/* -------------------------------------------------------------------------- */
/* Categories                                                                  */
/* -------------------------------------------------------------------------- */

/** The whole category write section is behind allowedTo("admin", "moderator"). */
export function canManageCategories(user: Actor): boolean {
    return hasRole(user, "admin", "moderator");
}

/* -------------------------------------------------------------------------- */
/* Reviews                                                                     */
/* -------------------------------------------------------------------------- */

export function canCreateReview(user: Actor): boolean {
    // `protect` + `checkBan` only: any signed-in, non-banned account may review.
    return Boolean(user);
}

/** `PATCH /review/:reviewId` — author only, no admin override. */
export function canEditReview(user: Actor, review: Pick<Review, "author">): boolean {
    return isSelf(user, review.author?.id);
}

/** `DELETE /review/:reviewId` — author, admin or moderator. */
export function canDeleteReview(user: Actor, review: Pick<Review, "author">): boolean {
    return hasRole(user, "admin", "moderator") || isSelf(user, review.author?.id);
}

/* -------------------------------------------------------------------------- */
/* Orders                                                                      */
/* -------------------------------------------------------------------------- */

/** `DELETE /order/:orderId` — buyer only; admins have no override here. */
export function canDeleteOrder(user: Actor, order: Pick<Order, "userId">): boolean {
    return isSelf(user, order.userId);
}

/** `PATCH /order/:orderId` — allowedTo("admin"). */
export function canChangeOrderStatus(user: Actor): boolean {
    return hasRole(user, "admin");
}

/* -------------------------------------------------------------------------- */
/* Users and moderation                                                        */
/* -------------------------------------------------------------------------- */

/** `DELETE /users/:id` — the account owner or an admin. */
export function canDeleteUser(user: Actor, targetUserId: string): boolean {
    return hasRole(user, "admin") || isSelf(user, targetUserId);
}

/** Every `/admin/*` route is `protect, allowedTo("admin")`. */
export function canModerate(user: Actor): boolean {
    return hasRole(user, "admin");
}

/**
 * All four moderation controllers refuse to act on yourself or on another
 * admin, before the service layer is even reached.
 */
export function canModerateTarget(user: Actor, target: Pick<ApiUser, "_id" | "role">) {
    if (!canModerate(user)) return false;
    if (isSelf(user, target._id)) return false;
    return target.role !== "admin";
}

/* -------------------------------------------------------------------------- */
/* Navigation                                                                  */
/* -------------------------------------------------------------------------- */

/** Whether the seller area is worth showing at all. */
export function hasSellerArea(user: Actor): boolean {
    return hasRole(user, "seller", "admin");
}

/** Whether any part of the staff area is reachable for this user. */
export function hasStaffArea(user: Actor): boolean {
    return hasRole(user, "admin", "moderator");
}
