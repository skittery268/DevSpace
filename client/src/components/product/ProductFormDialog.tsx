"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ImagePicker } from "./ImagePicker";
import { Alert } from "@/components/ui/Alert";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { FormModal, FormSection } from "@/components/ui/FormModal";
import { useAllCategories } from "@/features/categories/useCategories";
import { useCreateProduct, useUpdateProduct } from "@/features/products/useProducts";
import { applyServerErrors } from "@/lib/form-errors";
import { humanizeKey } from "@/lib/utils";
import {
    createProductFormSchema,
    MAX_IMAGES,
    type ProductFormOutput,
    type ProductFormValues,
} from "@/lib/validation/catalog.schemas";
import { toast } from "@/store/toast.store";
import type { Product } from "@/types/product.types";

const FIELDS = ["title", "description", "price", "stock"] as const;

interface ProductFormDialogProps {
    open: boolean;
    onClose: () => void;
    /** Present when editing; the category cannot be changed after creation. */
    product?: Product;
    /** Pre-selects a category when listing from a category page. */
    defaultCategoryId?: string;
}

/**
 * List and edit a product, in place.
 *
 * This is the widest dialog in the app — three sections and up to five image
 * slots — but it is still one form with one submit, so it belongs over the list
 * the seller came from rather than on a page of its own. Mount it only while
 * open so it starts from the product it was opened for.
 */
export function ProductFormDialog({
    open,
    onClose,
    product,
    defaultCategoryId,
}: ProductFormDialogProps) {
    const { t } = useTranslation();
    const isEditing = Boolean(product);

    const categoriesQuery = useAllCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();

    const [categoryId, setCategoryId] = useState(
        product?.category?.id ?? defaultCategoryId ?? "",
    );
    const [images, setImages] = useState<File[]>([]);
    const [formError, setFormError] = useState<string | null>(null);

    // Which attribute inputs exist depends on the selected category, so they are
    // held here rather than declared as fixed form fields.
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>(
        () =>
            Object.fromEntries(
                Object.entries(product?.attributes ?? {}).map(([key, value]) => [
                    key,
                    String(value),
                ]),
            ),
    );

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ProductFormValues, unknown, ProductFormOutput>({
        resolver: zodResolver(useMemo(() => createProductFormSchema(t), [t])),
        defaultValues: {
            title: product?.title ?? "",
            description: product?.description ?? "",
            price: product?.price ?? 1,
            stock: product?.stock ?? 1,
        },
    });

    const categories = categoriesQuery.data ?? [];
    const selectedCategory =
        categories.find((category) => category.id === categoryId) ?? null;

    /**
     * `createProduct` rejects any attribute key that is not in the category's
     * `allowedAttributes`, so keys are never free text — they come from the
     * category and only the values are editable.
     */
    const allowedAttributes = selectedCategory?.allowedAttributes ?? [];

    const setAttributeValue = (key: string, value: string) =>
        setAttributeValues((current) => ({ ...current, [key]: value }));

    const pending = createProduct.isPending || updateProduct.isPending;

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        if (!isEditing && !categoryId) {
            setFormError(t("productForm.pickCategory"));
            return;
        }

        // Only keys the category allows are ever sent: `createProduct` rejects the
        // whole request with a 400 if it sees anything else.
        const attributes = Object.fromEntries(
            Object.entries(attributeValues).filter(
                ([key, value]) => allowedAttributes.includes(key) && value.trim(),
            ),
        );

        try {
            if (product) {
                await updateProduct.mutateAsync({
                    productId: product.id,
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    stock: values.stock,
                    // Sending no files leaves the existing Cloudinary images alone;
                    // sending any replaces the whole array.
                    ...(images.length > 0 ? { images } : {}),
                    ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
                });
                toast.success(t("toast.productUpdated"), values.title);
            } else {
                const created = await createProduct.mutateAsync({
                    categoryId,
                    title: values.title,
                    description: values.description,
                    price: values.price,
                    stock: values.stock,
                    images,
                    ...(Object.keys(attributes).length > 0 ? { attributes } : {}),
                });
                toast.success(t("toast.productListed"), created.title);
            }
            // `useUpdateProduct` writes the fresh product straight into its detail
            // cache and both hooks invalidate the lists, so the page behind this
            // dialog catches up on its own.
            onClose();
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, [...FIELDS]));
        }
    });

    return (
        <FormModal
            open={open}
            onClose={onClose}
            size="xl"
            title={
                isEditing ? t("productForm.editTitle") : t("productForm.createTitle")
            }
            description={
                isEditing ? product?.title : t("productForm.createSubtitle")
            }
            submitLabel={
                isEditing ? t("common.saveChanges") : t("productForm.publish")
            }
            pending={pending}
            error={formError}
            onSubmit={(event) => void onSubmit(event)}
        >
            <FormSection
                title={t("productForm.basics")}
                description={t("productForm.basicsBody")}
            >
                {isEditing ? (
                    <Input
                        label={t("productForm.category")}
                        value={product?.category?.name ?? t("common.unknown")}
                        disabled
                        hint={t("productForm.categoryLockedHint")}
                        readOnly
                    />
                ) : (
                    <Select
                        label={t("productForm.category")}
                        required
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                        disabled={categoriesQuery.isPending}
                        hint={
                            selectedCategory && !selectedCategory.isActive
                                ? t("productForm.categoryInactiveHint")
                                : t("productForm.categoryHint")
                        }
                    >
                        <option value="">{t("productForm.categoryPlaceholder")}</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.parent
                                    ? t("productForm.categoryInOther", {
                                            name: category.name,
                                            parent: category.parent.name,
                                        })
                                    : category.name}
                            </option>
                        ))}
                    </Select>
                )}

                <Input
                    label={t("productForm.productTitle")}
                    required
                    placeholder={t("productForm.productTitlePlaceholder")}
                    hint={t("productForm.productTitleHint")}
                    error={errors.title?.message}
                    {...register("title")}
                />

                <Textarea
                    label={t("productForm.description")}
                    required
                    rows={4}
                    placeholder={t("productForm.descriptionPlaceholder")}
                    hint={t("productForm.descriptionHint")}
                    error={errors.description?.message}
                    {...register("description")}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                        type="number"
                        step="0.01"
                        min={1}
                        label={t("productForm.price")}
                        required
                        hint={t("productForm.priceHint")}
                        error={errors.price?.message}
                        {...register("price")}
                    />
                    <Input
                        type="number"
                        step="1"
                        min={1}
                        label={t("productForm.stock")}
                        required
                        hint={t("productForm.stockHint")}
                        error={errors.stock?.message}
                        {...register("stock")}
                    />
                </div>
            </FormSection>

            <FormSection
                title={t("productForm.images")}
                description={t("productForm.imagesBody", { count: MAX_IMAGES })}
            >
                <ImagePicker
                    files={images}
                    onChange={setImages}
                    max={MAX_IMAGES}
                    existingUrls={product?.images ?? []}
                    hint={
                        isEditing
                            ? t("productForm.imagesEditHint")
                            : t("productForm.imagesCreateHint")
                    }
                />
            </FormSection>

            {allowedAttributes.length > 0 ? (
                <FormSection
                    title={t("productForm.attributes")}
                    description={t("productForm.attributesBody")}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        {allowedAttributes.map((key) => (
                            <Input
                                key={key}
                                // The stored key stays exactly as the category declared it —
                                // the server matches on it — only the label is made readable.
                                label={humanizeKey(key)}
                                placeholder={t("productForm.attributePlaceholder", {
                                    name: humanizeKey(key).toLowerCase(),
                                })}
                                value={attributeValues[key] ?? ""}
                                onChange={(event) => setAttributeValue(key, event.target.value)}
                            />
                        ))}
                    </div>
                </FormSection>
            ) : selectedCategory ? (
                <Alert tone="info">
                    {t("productForm.noAttributes", { category: selectedCategory.name })}
                </Alert>
            ) : null}
        </FormModal>
    );
}
