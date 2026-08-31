"use client";

import {
    ChevronRight,
    Pencil,
    RotateCcw,
    ShieldCheck,
    Star,
    Trash2,
    Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AddToCartButton } from "./AddToCartButton";
import { ProductFormDialog } from "./ProductFormDialog";
import { ProductGallery } from "./ProductGallery";
import { RelatedProducts } from "./RelatedProducts";
import { WishlistButton } from "./WishlistButton";
import { Container } from "@/components/common/Container";
import { ErrorState } from "@/components/common/States";
import { ReviewSection } from "@/components/review/ReviewSection";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useDeleteProduct, useProduct } from "@/features/products/useProducts";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useFormat } from "@/i18n/useFormat";
import { canDeleteProduct, canEditProduct } from "@/lib/permissions";
import { humanizeKey, initialsOf } from "@/lib/utils";
import { toast } from "@/store/toast.store";

/**
 * `grid-cols-1` is not decoration.
 *
 * A grid with no explicit template places its items in an implicit `auto`
 * track, and `auto` is floored at `min-content` — so a description holding one
 * long URL made this column 810px wide on a 390px phone and took the page with
 * it. `grid-cols-1` is `repeat(1, minmax(0, 1fr))`, which floors the track at
 * zero instead.
 */
const LAYOUT =
    "grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,48%)_minmax(0,1fr)] lg:gap-14";

/** Claims the API can actually back, so the shelf is not decorative filler. */
const ASSURANCES = [
    {
        icon: ShieldCheck,
        titleKey: "products.assuranceCheckoutTitle",
        bodyKey: "products.assuranceCheckoutBody",
    },
    {
        icon: Truck,
        titleKey: "products.assuranceShippingTitle",
        bodyKey: "products.assuranceShippingBody",
    },
    {
        icon: RotateCcw,
        titleKey: "products.assurancePaymentTitle",
        bodyKey: "products.assurancePaymentBody",
    },
] as const;

function DetailSkeleton() {
    return (
        <div className={LAYOUT}>
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-3/4" />
                <Skeleton className="h-8 w-32" />
                <SkeletonText lines={4} />
                <div className="flex gap-3 pt-2">
                    <Skeleton className="h-12 w-32" />
                    <Skeleton className="h-12 w-40" />
                </div>
            </div>
        </div>
    );
}

export function ProductDetail({ productId }: { productId: string }) {
    const { t } = useTranslation();
    const format = useFormat();
    const errorMessage = useErrorMessage();
    const { user } = useAuth();
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [editing, setEditing] = useState(false);

    const { data: product, isPending, isError, error, refetch } = useProduct(productId);
    const deleteProduct = useDeleteProduct();

    if (isPending) {
        return (
            <Container className="py-10">
                <DetailSkeleton />
            </Container>
        );
    }

    if (isError) {
        return (
            <Container className="py-10">
                <ErrorState
                    error={error}
                    title={
                        error.isNotFound
                            ? t("products.notFound")
                            : t("products.loadFailed")
                    }
                    onRetry={error.isNotFound ? undefined : () => void refetch()}
                />
                <div className="mt-6 flex justify-center">
                    <ButtonLink href="/products" variant="outline">
                        {t("products.backToProducts")}
                    </ButtonLink>
                </div>
            </Container>
        );
    }

    const mayEdit = canEditProduct(user, product);
    const mayDelete = canDeleteProduct(user, product);
    const attributeEntries = Object.entries(product.attributes);
    const maxQuantity = Math.max(1, product.stock);

    const handleDelete = async () => {
        try {
            await deleteProduct.mutateAsync(product.id);
            toast.success(t("toast.productDeleted"), product.title);
            router.push("/products");
        } catch {
            // The dialog renders the mutation error.
        }
    };

    return (
        <Container className="py-8 lg:py-12">
            <nav
                aria-label={t("common.breadcrumb")}
                className="mb-8 flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-500"
            >
                <Link href="/products" className="transition-colors hover:text-link">
                    {t("nav.products")}
                </Link>
                {product.category ? (
                    <>
                        <ChevronRight className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                        <Link
                            href={`/categories/${product.category.id}`}
                            className="transition-colors hover:text-link"
                        >
                            {product.category.name}
                        </Link>
                    </>
                ) : null}
                <ChevronRight className="size-3.5 shrink-0 text-ink-400" aria-hidden />
                <span className="min-w-0 max-w-full flex-1 truncate font-medium text-ink-700">
                    {product.title}
                </span>
            </nav>

            <div className={LAYOUT}>
                <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:self-start">
                    <ProductGallery images={product.images} title={product.title} />
                </div>

                <div>
                    {product.category ? (
                        <Link
                            href={`/categories/${product.category.id}`}
                            className="text-xs font-semibold uppercase tracking-[0.14em] text-link transition-colors hover:text-link-strong"
                        >
                            {product.category.name}
                        </Link>
                    ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-400">
                            {t("common.uncategorized")}
                        </span>
                    )}

                    <h1 className="mt-2.5 wrap-anywhere text-[clamp(1.5rem,1.1rem+2vw,2.5rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-ink-900">
                        {product.title}
                    </h1>

                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2.5">
                        <span className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-ink-900">
                            {format.price(product.price)}
                        </span>
                        <span aria-hidden className="h-5 w-px bg-ink-200" />
                        {product.stock > 0 ? (
                            <Badge tone={product.stock <= 5 ? "warning" : "success"}>
                                {t("products.inStock", { count: product.stock })}
                            </Badge>
                        ) : (
                            <Badge tone="danger">{t("products.outOfStock")}</Badge>
                        )}
                        <a
                            href="#reviews"
                            className="inline-flex items-center gap-1.5 text-sm text-ink-500 transition-colors hover:text-link"
                        >
                            <Star className="size-4 text-star" aria-hidden />
                            {t("count.reviews", { count: product.reviewsCount })}
                        </a>
                    </div>

                    <p className="mt-6 wrap-anywhere whitespace-pre-line text-sm leading-relaxed text-ink-600">
                        {product.description}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center gap-3">
                        <QuantityStepper
                            value={quantity}
                            onChange={setQuantity}
                            max={maxQuantity}
                            disabled={product.stock <= 0}
                        />
                        <WishlistButton product={product} size="lg" className="sm:order-last" />
                        {/* Full width on its own row below `sm`, where a stepper, a
                                label as long as "Add to cart" and a second button cannot
                                share 288px without one of them becoming unreadable. */}
                        <AddToCartButton
                            product={product}
                            quantity={quantity}
                            size="lg"
                            className="order-last w-full sm:order-none sm:w-auto sm:flex-1 lg:flex-none"
                        />
                    </div>

                    {mayEdit || mayDelete ? (
                        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-ink-300 bg-surface-3 p-3">
                            <span className="w-full text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-500">
                                {t("products.manageListing")}
                            </span>
                            {mayEdit ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                >
                                    <Pencil className="size-4" aria-hidden />
                                    {t("common.edit")}
                                </Button>
                            ) : null}
                            {mayDelete ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-danger hover:bg-danger-soft"
                                    onClick={() => setConfirmingDelete(true)}
                                >
                                    <Trash2 className="size-4" aria-hidden />
                                    {t("common.delete")}
                                </Button>
                            ) : null}
                        </div>
                    ) : null}

                    <ul className="mt-8 divide-y divide-ink-200 overflow-hidden rounded-xl border border-ink-200 bg-surface">
                        {ASSURANCES.map(({ icon: Icon, titleKey, bodyKey }) => (
                            <li key={titleKey} className="flex gap-3.5 px-4 py-3.5">
                                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-link">
                                    <Icon className="size-4" aria-hidden />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-ink-900">
                                        {t(titleKey)}
                                    </p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-ink-500">
                                        {t(bodyKey)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/*
                        A specification row is a label and a value that can both be long
                        — "Panel technology" against "VA quantum-dot backlit". Below
                        `sm` they stack; above it they sit on one line with the value
                        right-aligned and free to wrap, which is what `min-w-0` on both
                        halves buys.
                    */}
                    <dl className="mt-8 divide-y divide-ink-200 border-t border-ink-200 text-sm">
                        <div className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:justify-between sm:gap-4">
                            <dt className="min-w-0 text-ink-500">{t("products.seller")}</dt>
                            <dd className="min-w-0 wrap-anywhere font-medium text-ink-900 sm:text-right">
                                {product.seller?.fullname ?? t("common.unknown")}
                            </dd>
                        </div>
                        <div className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:justify-between sm:gap-4">
                            <dt className="min-w-0 text-ink-500">{t("products.listed")}</dt>
                            <dd className="min-w-0 font-medium text-ink-900 sm:text-right">
                                {format.date(product.createdAt)}
                            </dd>
                        </div>
                        {attributeEntries.map(([key, value]) => (
                            <div
                                key={key}
                                className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:justify-between sm:gap-4"
                            >
                                <dt className="min-w-0 wrap-anywhere text-ink-500">
                                    {humanizeKey(key)}
                                </dt>
                                <dd className="min-w-0 wrap-anywhere font-medium text-ink-900 sm:text-right">
                                    {String(value)}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>
            </div>

            <div
                id="reviews"
                className="mt-16 grid grid-cols-1 gap-6 scroll-mt-[calc(var(--header-h)+1.5rem)] lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
            >
                <ReviewSection productId={product.id} />

                <Card className="h-fit">
                    <CardHeader title={t("products.aboutSeller")} />
                    <CardBody className="space-y-4 text-sm">
                        <div className="flex items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                                {product.seller ? initialsOf(product.seller.fullname) || "?" : "?"}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-semibold text-ink-900">
                                    {product.seller?.fullname ?? t("products.unknownSeller")}
                                </p>
                                <p className="text-xs text-ink-500">
                                    {t("products.listedOn", {
                                        date: format.date(product.createdAt),
                                    })}
                                </p>
                            </div>
                        </div>

                        <p className="leading-relaxed text-ink-500">
                            {t("products.aboutSellerBody")}
                        </p>

                        {product.category?.allowedAttributes.length ? (
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                                    {t("products.categoryAttributes")}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {product.category.allowedAttributes.map((attribute) => (
                                        <Badge key={attribute}>{attribute}</Badge>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </CardBody>
                </Card>
            </div>

            {product.category ? (
                <RelatedProducts category={product.category} excludeProductId={product.id} />
            ) : null}

            {editing ? (
                <ProductFormDialog
                    open
                    product={product}
                    onClose={() => setEditing(false)}
                />
            ) : null}

            <ConfirmDialog
                open={confirmingDelete}
                title={t("products.deleteConfirmTitle")}
                description={t("products.deleteConfirmBody")}
                confirmLabel={t("products.deleteAction")}
                loading={deleteProduct.isPending}
                error={
                    deleteProduct.error ? errorMessage(deleteProduct.error) : null
                }
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    deleteProduct.reset();
                    setConfirmingDelete(false);
                }}
            />
        </Container>
    );
}
