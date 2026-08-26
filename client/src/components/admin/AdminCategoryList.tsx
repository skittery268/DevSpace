"use client";

import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { CategoryFormDialog } from "@/components/category/CategoryFormDialog";
import { RemoteImage } from "@/components/common/RemoteImage";
import { PageHeader } from "@/components/common/Container";
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
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import {
    useCategories,
    useDeleteCategory,
} from "@/features/categories/useCategories";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { usePageParam } from "@/hooks/usePageParam";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { truncate } from "@/lib/utils";
import { toast } from "@/store/toast.store";
import type { Category } from "@/types/category.types";

export function AdminCategoryList() {
    const { t } = useTranslation();
    const errorMessage = useErrorMessage();
    const { page, setPage } = usePageParam();
    const { data, isPending, isError, error, isFetching, refetch } = useCategories(
        page,
        DEFAULT_PAGE_SIZE,
    );
    const deleteCategory = useDeleteCategory();
    const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

    // `null` while closed. Mounting the dialog only when this is set is what makes
    // it open on the right record: the form reads its defaults once, at mount.
    const [editing, setEditing] = useState<
        { mode: "create" } | { mode: "edit"; category: Category } | null
    >(null);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteCategory.mutateAsync(pendingDelete.id);
            toast.success(t("toast.categoryDeleted"), pendingDelete.name);
            setPendingDelete(null);
        } catch {
            // The dialog renders the mutation error, including the 409 guard.
        }
    };

    return (
        <>
            <PageHeader
                title={t("categories.title")}
                description={t("admin.categoriesSubtitle")}
                action={
                    <Button onClick={() => setEditing({ mode: "create" })}>
                        <Plus className="size-4" />
                        {t("admin.newCategory")}
                    </Button>
                }
            />

            {isError ? (
                <ErrorState error={error} onRetry={() => void refetch()} />
            ) : !isPending && data.items.length === 0 ? (
                <EmptyState
                    icon={<FolderTree className="size-6" />}
                    title={t("admin.categoriesEmptyTitle")}
                    description={t("admin.categoriesEmptyBody")}
                    action={
                        <Button onClick={() => setEditing({ mode: "create" })}>
                            <Plus className="size-4" />
                            {t("admin.createFirstCategory")}
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
                                    {t("count.categories", { count: data.total })}
                                </span>
                            )}
                        </p>
                    }
                    footer={
                        !isPending && data.pageCount > 1 ? (
                            <Pagination
                                className="w-full"
                                page={data.page}
                                pageCount={data.pageCount}
                                onPageChange={setPage}
                                disabled={isFetching}
                            />
                        ) : undefined
                    }
                >
                    <div className="hidden md:block">
                    <Table className="min-w-[42rem]">
                        <THead>
                            <TH className="w-[38%]">{t("admin.columnCategory")}</TH>
                            <TH>{t("admin.columnAttributes")}</TH>
                            <TH className="w-28">{t("common.status")}</TH>
                            <TH align="right" className="w-28">
                                {t("common.actions")}
                            </TH>
                        </THead>

                        {isPending ? (
                            <TableSkeletonRows columns={4} rows={5} />
                        ) : (
                            <TBody>
                                {data.items.map((category) => (
                                    <TR key={category.id}>
                                        <TD>
                                            <div className="flex items-center gap-3">
                                                <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
                                                    <RemoteImage
                                                        src={category.imageUrl}
                                                        alt={category.name}
                                                        sizes="44px"
                                                    />
                                                </span>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/categories/${category.id}`}
                                                        className="block truncate font-medium text-ink-900 transition-colors hover:text-link"
                                                    >
                                                        {category.name}
                                                    </Link>
                                                    <p className="truncate text-xs text-ink-500">
                                                        {category.parent
                                                            ? t("categories.inParent", {
                                                                    name: category.parent.name,
                                                                })
                                                            : truncate(category.description, 48)}
                                                    </p>
                                                </div>
                                            </div>
                                        </TD>

                                        <TD>
                                            {category.allowedAttributes.length === 0 ? (
                                                <span className="text-xs text-ink-400">
                                                    {t("common.none")}
                                                </span>
                                            ) : (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {category.allowedAttributes.slice(0, 3).map((attribute) => (
                                                        <Badge key={attribute} tone="neutral">
                                                            {attribute}
                                                        </Badge>
                                                    ))}
                                                    {category.allowedAttributes.length > 3 ? (
                                                        <Badge tone="neutral">
                                                            +{category.allowedAttributes.length - 3}
                                                        </Badge>
                                                    ) : null}
                                                </div>
                                            )}
                                        </TD>

                                        <TD>
                                            <Badge tone={category.isActive ? "success" : "warning"}>
                                                {category.isActive
                                                    ? t("common.active")
                                                    : t("common.inactive")}
                                            </Badge>
                                        </TD>

                                        <TD align="right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={t("admin.editCategoryAria", {
                                                        name: category.name,
                                                    })}
                                                    onClick={() => setEditing({ mode: "edit", category })}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={t("admin.deleteCategoryAria", {
                                                        name: category.name,
                                                    })}
                                                    className="text-danger hover:bg-danger-soft hover:text-danger"
                                                    onClick={() => setPendingDelete(category)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TD>
                                    </TR>
                                ))}
                            </TBody>
                        )}
                    </Table>
                    </div>

                    {/* Below `md` the same rows stack, so the edit and delete controls
                            stay on screen instead of living past a sideways scroll. */}
                    <ul className="divide-y divide-ink-200 md:hidden">
                        {isPending
                            ? Array.from({ length: 4 }).map((_, index) => (
                                    <li key={index} className="px-4 py-4">
                                        <Skeleton className="h-14 w-full" />
                                    </li>
                                ))
                            : data.items.map((category) => (
                                    <li key={category.id} className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
                                                <RemoteImage
                                                    src={category.imageUrl}
                                                    alt={category.name}
                                                    sizes="44px"
                                                />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    href={`/categories/${category.id}`}
                                                    className="block truncate text-sm font-medium text-ink-900"
                                                >
                                                    {category.name}
                                                </Link>
                                                <p className="truncate text-xs text-ink-500">
                                                    {category.parent
                                                        ? t("categories.inParent", {
                                                                name: category.parent.name,
                                                            })
                                                        : truncate(category.description, 40)}
                                                </p>
                                            </div>
                                            <Badge tone={category.isActive ? "success" : "warning"}>
                                                {category.isActive
                                                    ? t("common.active")
                                                    : t("common.inactive")}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between gap-3">
                                            <div className="flex min-w-0 flex-wrap gap-1.5">
                                                {category.allowedAttributes.slice(0, 2).map((attribute) => (
                                                    <Badge key={attribute} tone="neutral">
                                                        {attribute}
                                                    </Badge>
                                                ))}
                                                {category.allowedAttributes.length > 2 ? (
                                                    <Badge tone="neutral">
                                                        +{category.allowedAttributes.length - 2}
                                                    </Badge>
                                                ) : null}
                                            </div>

                                            <div className="flex shrink-0 gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={t("admin.editCategoryAria", {
                                                        name: category.name,
                                                    })}
                                                    onClick={() => setEditing({ mode: "edit", category })}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={t("admin.deleteCategoryAria", {
                                                        name: category.name,
                                                    })}
                                                    className="text-danger hover:bg-danger-soft hover:text-danger"
                                                    onClick={() => setPendingDelete(category)}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                    </ul>
                </TableFrame>
            )}

            <Alert tone="info" className="mt-6">
                {t("admin.deleteCategoryNote")}
            </Alert>

            {editing ? (
                <CategoryFormDialog
                    open
                    category={editing.mode === "edit" ? editing.category : undefined}
                    onClose={() => setEditing(null)}
                />
            ) : null}

            <ConfirmDialog
                open={pendingDelete !== null}
                title={t("admin.deleteCategoryTitle")}
                description={
                    pendingDelete
                        ? t("admin.deleteCategoryBody", { name: pendingDelete.name })
                        : undefined
                }
                confirmLabel={t("admin.deleteCategoryAction")}
                loading={deleteCategory.isPending}
                error={deleteCategory.error ? errorMessage(deleteCategory.error) : null}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    deleteCategory.reset();
                    setPendingDelete(null);
                }}
            />
        </>
    );
}
