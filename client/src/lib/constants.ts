import type { OrderStatus } from "@/types/order.types";
import type { Role } from "@/types/user.types";

export const APP_NAME = "DevSpace";
export const APP_TAGLINE = "A marketplace built by and for makers";

/** Matches the backend default (`limit = Math.min(Number(limit), 100) || 12`). */
export const DEFAULT_PAGE_SIZE = 12;
/** The hard cap enforced by every list controller. */
export const MAX_PAGE_SIZE = 100;

/** Stripe line items are priced in USD by the checkout controller. */
export const CURRENCY = "USD";

/**
 * Labels are translation keys rather than strings.
 *
 * The role and status vocabularies come from the backend as stable identifiers;
 * turning one into words is a presentation concern, so these hand the caller a
 * key to run through `t(...)` instead of baking English into a constant.
 */
export function roleLabelKey(role: Role) {
    return `roles.${role}` as const;
}

export function orderStatusLabelKey(status: OrderStatus) {
    return `orderStatus.${status}` as const;
}

export const ORDER_STATUS_TONES: Record<
    OrderStatus,
    "neutral" | "info" | "success" | "warning" | "danger"
> = {
    confirmed: "info",
    processing: "info",
    shipped: "info",
    delivered: "success",
    completed: "success",
    canceled: "danger",
    refunded: "warning",
    partially_refunded: "warning",
};

/** TOTP codes and password-reset codes are both exactly six digits. */
export const SIX_DIGIT_CODE = /^\d{6}$/;

/**
 * Email verification is temporarily switched off.
 *
 * `register` on the server creates the account with `isVerified: true` and skips
 * the verification mail, so sign-in works straight away. The post-registration
 * "check your inbox" screen is kept intact behind this flag — flip it back to
 * `true` at the same time as the server change is reverted.
 */
export const EMAIL_VERIFICATION_ENABLED: boolean = false;
