"use client";

import { Boxes, MessageSquare, Package, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { RemoteImage } from "@/components/common/RemoteImage";
import { ProductFormDialog } from "@/components/product/ProductFormDialog";
import { Container, PageHeader } from "@/components/common/Container";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
    Table,
    TableFrame,
    TableSkeletonRows,
    TBody,
    TD,
    TH,
    THead,
    TR,
} from "@/components/ui/DataTable";
import { StatCard, StatCardGrid } from "@/components/ui/StatCard";
import { useAuth } from "@/features/auth/useAuth";
import { useDeleteProduct, useMyProducts } from "@/features/products/useProducts";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useFormat } from "@/i18n/useFormat";
import { canDeleteProduct, canEditProduct } from "@/lib/permissions";
import { toast } from "@/store/toast.store";
import type { Product } from "@/types/product.types";

export function SellerDashboard() {
    const { t } = useTranslation();
    const format = useFormat();
    const errorMessage = useErrorMessage();
    const { user } = useAuth();
    const { data, isPending, isError, error, refetch } = useMyProducts(user?._id);
    const deleteProduct = useDeleteProduct();
    const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

    // Mounted only while set, so the form always opens on the right listing.
    const [editing, setEditing] = useState<
        { mode: "create" } | { mode: "edit"; product: Product } | null
    >(null);

    const products = data ?? [];
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const totalReviews = products.reduce(
        (sum, product) => sum + product.reviewsCount,
        0,
    );

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteProduct.mutateAsync(pendingDelete.id);
            toast.success(t("toast.productDeleted"), pendingDelete.title);
            setPendingDelete(null);
        } catch {
            // The dialog renders the mutation error.
        }
    };

    return (
        <Container className="py-10">
            <PageHeader
                title={t("seller.title")}
                description={t("seller.subtitle")}
                action={
                    <Button onClick={() => setEditing({ mode: "create" })}>
                        <Plus className="size-4" />
                        {t("seller.listProduct")}
                    </Button>
                }
            />

            <StatCardGrid className="mb-6 xl:grid-cols-3">
                <StatCard
                    icon={Package}
                    tone="brand"
                    label={t("seller.statListings")}
                    value={format.number(products.length)}
                    hint={t("seller.statListingsHint")}
                    loading={isPending}
                />
                <StatCard
                    icon={Boxes}
                    tone="teal"
                    label={t("seller.statStock")}
                    value={format.number(totalStock)}
                    hint={t("seller.statStockHint")}
                    loading={isPending}
                />
                <StatCard
                    icon={MessageSquare}
                    tone="amber"
                    label={t("seller.statReviews")}
                    value={format.number(totalReviews)}
                    hint={t("seller.statReviewsHint")}
                    loading={isPending}
                />
            </StatCardGrid>

            <Alert tone="info" className="mb-6" title={t("seller.apiNoteTitle")}>
                {t("seller.apiNoteBody")}
            </Alert>

            {isError ? (
                <ErrorState error={error} onRetry={() => void refetch()} />
            ) : !isPending && products.length === 0 ? (
                <EmptyState
                    icon={<Package className="size-6" />}
                    title={t("seller.emptyTitle")}
                    description={t("seller.emptyBody")}
                    action={
                        <Button onClick={() => setEditing({ mode: "create" })}>
                            <Plus className="size-4" />
                            {t("seller.listProduct")}
                        </Button>
                    }
                />
            ) : (
                <TableFrame
                    toolbar={
                        <p className="text-sm text-ink-500">
                            {isPending ? (
                                t("common.loading")
                            ) : (
                                <span className="font-semibold text-ink-900">
                                    {t("count.listings", { count: products.length })}
                                </span>
                            )}
                        </p>
                    }
                >
                    <Table>
                        <THead>
                            <TH className="w-[42%]">{t("seller.columnProduct")}</TH>
                            <TH className="w-32">{t("seller.columnCategory")}</TH>
                            <TH align="right" className="w-28">
                                {t("seller.columnPrice")}
                            </TH>
                            <TH className="w-32">{t("seller.columnStock")}</TH>
                            <TH align="right" className="w-24">
                                {t("common.actions")}
                            </TH>
                        </THead>

                        {isPending ? (
                            <TableSkeletonRows columns={5} rows={4} />
                        ) : (
                            <TBody>
                                {products.map((product) => (
                                    <TR key={product.id}>
                                        <TD>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-100"
                                                >
                                                    <RemoteImage
                                                        src={product.images[0]}
                                                        alt={product.title}
                                                        sizes="44px"
                                                    />
                                                </Link>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/products/${product.id}`}
                                                        className="block truncate font-medium text-ink-900 transition-colors hover:text-link"
                                                    >
                                                        {product.title}
                                                    </Link>
                                                    <p className="truncate text-xs text-ink-500">
                                                        {t("count.reviews", {
                                                            count: product.reviewsCount,
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                        </TD>

                                        <TD className="text-ink-500">
                                            {product.category?.name ?? t("common.uncategorized")}
                                        </TD>

                                        <TD align="right" className="font-semibold tabular-nums text-ink-900">
                                            {format.price(product.price)}
                                        </TD>

                                        <TD>
                                            <Badge
                                                tone={
                                                    product.stock <= 0
                                                        ? "danger"
                                                        : product.stock <= 5
                                                            ? "warning"
                                                            : "success"
                                                }
                                            >
                                                {product.stock <= 0
                                                    ? t("products.outOfStock")
                                                    : t("products.inStock", { count: product.stock })}
                                            </Badge>
                                        </TD>

                                        <TD align="right">
                                            <div className="flex justify-end gap-1">
                                                {canEditProduct(user, product) ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label={t("products.editAria", {
                                                            title: product.title,
                                                        })}
                                                        onClick={() => setEditing({ mode: "edit", product })}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                ) : null}
                                                {canDeleteProduct(user, product) ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        aria-label={t("products.deleteAria", {
                                                            title: product.title,
                                                        })}
                                                        className="text-danger hover:bg-danger-soft hover:text-danger"
                                                        onClick={() => setPendingDelete(product)}
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        )}
                    </Table>
                </TableFrame>
            )}

            {editing ? (
                <ProductFormDialog
                    open
                    product={editing.mode === "edit" ? editing.product : undefined}
                    onClose={() => setEditing(null)}
                />
            ) : null}

            <ConfirmDialog
                open={pendingDelete !== null}
                title={t("products.deleteConfirmTitle")}
                description={
                    pendingDelete
                        ? t("products.deleteConfirmBodyShort", {
                                title: pendingDelete.title,
                            })
                        : undefined
                }
                confirmLabel={t("products.deleteAction")}
                loading={deleteProduct.isPending}
                error={deleteProduct.error ? errorMessage(deleteProduct.error) : null}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    deleteProduct.reset();
                    setPendingDelete(null);
                }}
            />
        </Container>
    );
}
