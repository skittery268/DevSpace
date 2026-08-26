"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { RatingInput } from "./RatingStars";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { useCreateReview, useUpdateReview } from "@/features/reviews/useReviews";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createReviewFormSchema,
    type ReviewFormOutput,
    type ReviewFormValues,
} from "@/lib/validation/catalog.schemas";
import { toast } from "@/store/toast.store";
import type { Review } from "@/types/review.types";

interface ReviewFormProps {
    productId: string;
    /** Present when editing; the backend allows the author only. */
    review?: Review;
    onDone?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({
    productId,
    review,
    onDone,
    onCancel,
}: ReviewFormProps) {
    const { t } = useTranslation();
    const isEditing = Boolean(review);
    const createReview = useCreateReview(productId);
    const updateReview = useUpdateReview(productId);
    const [formError, setFormError] = useState<string | null>(null);

    const {
        control,
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<ReviewFormValues, unknown, ReviewFormOutput>({
        resolver: zodResolver(useMemo(() => createReviewFormSchema(t), [t])),
        defaultValues: {
            rating: review?.rating ?? 5,
            content: review?.content ?? "",
        },
    });

    const pending = createReview.isPending || updateReview.isPending;

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        try {
            if (review) {
                await updateReview.mutateAsync({
                    reviewId: review.id,
                    content: values.content,
                    rating: values.rating,
                });
                toast.success(t("toast.reviewUpdated"));
            } else {
                await createReview.mutateAsync({
                    productId,
                    content: values.content,
                    rating: values.rating,
                });
                toast.success(t("toast.reviewPosted"));
                reset({ rating: 5, content: "" });
            }
            onDone?.();
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, ["rating", "content"]));
        }
    });

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {formError ? <Alert tone="error">{formError}</Alert> : null}

            <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink-800">
                    {t("reviews.yourRating")}
                </span>
                <Controller
                    control={control}
                    name="rating"
                    render={({ field }) => (
                        <RatingInput
                            value={Number(field.value) || 0}
                            onChange={field.onChange}
                            disabled={pending}
                        />
                    )}
                />
                {errors.rating ? (
                    <p className="text-xs font-medium text-danger">
                        {errors.rating.message}
                    </p>
                ) : null}
            </div>

            <Textarea
                label={t("reviews.yourReview")}
                placeholder={t("reviews.contentPlaceholder")}
                rows={4}
                error={errors.content?.message}
                disabled={pending}
                {...register("content")}
            />

            <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={pending}>
                    {isEditing ? t("common.saveChanges") : t("reviews.post")}
                </Button>
                {onCancel ? (
                    <Button variant="ghost" onClick={onCancel} disabled={pending}>
                        {t("common.cancel")}
                    </Button>
                ) : null}
            </div>
        </form>
    );
}
