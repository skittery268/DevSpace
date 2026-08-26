"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { ImagePicker } from "@/components/product/ImagePicker";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { FormModal, FormSection } from "@/components/ui/FormModal";
import {
    useAllCategories,
    useCreateCategory,
    useUpdateCategory,
} from "@/features/categories/useCategories";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createCategoryFormSchema,
    type CategoryFormOutput,
    type CategoryFormValues,
} from "@/lib/validation/catalog.schemas";
import { toast } from "@/store/toast.store";
import type { Category } from "@/types/category.types";

const FIELDS = ["name", "description", "parentCategory"] as const;

interface CategoryFormDialogProps {
    open: boolean;
    onClose: () => void;
    /** Present when editing. */
    category?: Category;
    /** Pre-selects a parent when creating from inside another category. */
    defaultParentId?: string;
}

/**
 * Create and edit a category, in place.
 *
 * Mount this only while it is open (`{state ? <CategoryFormDialog … /> : null}`)
 * so each opening starts from the record it was opened for — the form's default
 * values are read once, at mount.
 */
export function CategoryFormDialog({
    open,
    onClose,
    category,
    defaultParentId,
}: CategoryFormDialogProps) {
    const { t } = useTranslation();
    const isEditing = Boolean(category);

    const categoriesQuery = useAllCategories();
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const [image, setImage] = useState<File[]>([]);
    const [attributeDraft, setAttributeDraft] = useState("");
    const [formError, setFormError] = useState<string | null>(null);

    // A tag list rather than a fixed input, so it lives outside the form schema.
    const [allowedAttributes, setAllowedAttributes] = useState<string[]>(
        () => category?.allowedAttributes ?? [],
    );

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<CategoryFormValues, unknown, CategoryFormOutput>({
        resolver: zodResolver(useMemo(() => createCategoryFormSchema(t), [t])),
        defaultValues: {
            name: category?.name ?? "",
            description: category?.description ?? "",
            parentCategory: category?.parent?.id ?? defaultParentId ?? "",
        },
    });

    const pending = createCategory.isPending || updateCategory.isPending;

    // A category cannot be its own parent, and the backend performs no cycle
    // check, so at least the direct self-reference is blocked here.
    const parentOptions = (categoriesQuery.data ?? []).filter(
        (option) => option.id !== category?.id,
    );

    const addAttribute = () => {
        const value = attributeDraft.trim();
        setAttributeDraft("");
        if (!value || allowedAttributes.includes(value)) return;
        setAllowedAttributes((current) => [...current, value]);
    };

    const removeAttribute = (value: string) =>
        setAllowedAttributes((current) => current.filter((item) => item !== value));

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        if (!isEditing && image.length === 0) {
            setFormError(t("categoryForm.imageRequired"));
            return;
        }

        try {
            if (category) {
                await updateCategory.mutateAsync({
                    categoryId: category.id,
                    input: {
                        name: values.name,
                        description: values.description,
                        allowedAttributes,
                        ...(values.parentCategory
                            ? { parentCategory: values.parentCategory }
                            : {}),
                        ...(image[0] ? { image: image[0] } : {}),
                    },
                });
                toast.success(t("toast.categoryUpdated"), values.name);
            } else {
                await createCategory.mutateAsync({
                    name: values.name,
                    description: values.description,
                    allowedAttributes,
                    ...(values.parentCategory
                        ? { parentCategory: values.parentCategory }
                        : {}),
                    image: image[0]!,
                });
                toast.success(t("toast.categoryCreated"), values.name);
            }
            // The mutation hooks invalidate the category queries, so whatever list is
            // behind this dialog refetches itself while it closes.
            onClose();
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, [...FIELDS]));
        }
    });

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={
                isEditing ? t("categoryForm.editTitle") : t("categoryForm.createTitle")
            }
            description={
                isEditing ? category?.name : t("categoryForm.createSubtitle")
            }
            submitLabel={
                isEditing ? t("common.saveChanges") : t("categoryForm.createAction")
            }
            pending={pending}
            error={formError}
            onSubmit={(event) => void onSubmit(event)}
        >
            <FormSection title={t("categoryForm.details")}>
                <Input
                    label={t("categoryForm.name")}
                    required
                    placeholder={t("categoryForm.namePlaceholder")}
                    hint={t("categoryForm.nameHint")}
                    error={errors.name?.message}
                    {...register("name")}
                />

                <Textarea
                    label={t("categoryForm.description")}
                    required
                    rows={3}
                    hint={t("categoryForm.descriptionHint")}
                    error={errors.description?.message}
                    {...register("description")}
                />

                <Select
                    label={t("categoryForm.parent")}
                    disabled={categoriesQuery.isPending}
                    hint={
                        isEditing
                            ? t("categoryForm.parentEditHint")
                            : t("categoryForm.parentCreateHint")
                    }
                    error={errors.parentCategory?.message}
                    {...register("parentCategory")}
                >
                    <option value="">{t("categoryForm.noParent")}</option>
                    {parentOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </Select>
            </FormSection>

            <FormSection
                title={t("categoryForm.image")}
                description={t("categoryForm.imageBody")}
            >
                <ImagePicker
                    files={image}
                    onChange={setImage}
                    max={1}
                    label={t("categoryForm.imageLabel")}
                    existingUrls={category?.imageUrl ? [category.imageUrl] : []}
                    hint={
                        isEditing
                            ? t("categoryForm.imageEditHint")
                            : t("categoryForm.imageCreateHint")
                    }
                />
            </FormSection>

            <FormSection
                title={t("categoryForm.allowedAttributes")}
                description={t("categoryForm.allowedAttributesBody")}
            >
                <div className="flex gap-2">
                    <Input
                        wrapperClassName="flex-1"
                        placeholder={t("categoryForm.attributePlaceholder")}
                        value={attributeDraft}
                        onChange={(event) => setAttributeDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                // Otherwise Enter here would submit the whole dialog.
                                event.preventDefault();
                                addAttribute();
                            }
                        }}
                        aria-label={t("categoryForm.newAttributeName")}
                    />
                    <Button variant="outline" onClick={addAttribute} className="h-11">
                        <Plus className="size-4" />
                        {t("common.add")}
                    </Button>
                </div>

                {allowedAttributes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {allowedAttributes.map((attribute) => (
                            <span
                                key={attribute}
                                className="inline-flex items-center gap-1 rounded-full bg-brand-soft py-0.5 pl-2.5 pr-1 text-xs font-medium text-link ring-1 ring-inset ring-brand-line"
                            >
                                {attribute}
                                <button
                                    type="button"
                                    onClick={() => removeAttribute(attribute)}
                                    aria-label={t("categoryForm.removeAttribute", {
                                        name: attribute,
                                    })}
                                    className="rounded-full p-0.5 transition-colors hover:bg-brand-soft-hover"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-ink-500">
                        {t("categoryForm.noAttributes")}
                    </p>
                )}

                {isEditing ? (
                    <Alert tone="warning">{t("categoryForm.attributeWarning")}</Alert>
                ) : null}
            </FormSection>
        </FormModal>
    );
}
