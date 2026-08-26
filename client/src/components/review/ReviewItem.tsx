"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/features/auth/useAuth";
import { useDeleteReview } from "@/features/reviews/useReviews";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useFormat } from "@/i18n/useFormat";
import { canDeleteReview, canEditReview } from "@/lib/permissions";
import { initialsOf } from "@/lib/utils";
import { toast } from "@/store/toast.store";
import type { Review } from "@/types/review.types";

export function ReviewItem({ review }: { review: Review }) {
    const { t } = useTranslation();
    const format = useFormat();
    const errorMessage = useErrorMessage();
    const { user } = useAuth();
    const [editing, setEditing] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const deleteReview = useDeleteReview(review.productId);

    const mayEdit = canEditReview(user, review);
    const mayDelete = canDeleteReview(user, review);

    const handleDelete = async () => {
        try {
            await deleteReview.mutateAsync(review.id);
            toast.success(t("toast.reviewDeleted"));
            setConfirming(false);
        } catch {
            // The dialog surfaces the message; the mutation keeps the error state.
        }
    };

    return (
        <li className="border-b border-ink-200 py-5 last:border-b-0">
            {editing ? (
                <ReviewForm
                    productId={review.productId}
                    review={review}
                    onDone={() => setEditing(false)}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                <>
                    <div className="flex items-start gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-xs font-semibold text-ink-600">
                            {review.author ? initialsOf(review.author.fullname) : "?"}
                        </span>

                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="text-sm font-semibold text-ink-900">
                                    {review.author?.fullname ?? t("reviews.deletedAccount")}
                                </span>
                                <RatingStars value={review.rating} />
                                <span className="text-xs text-ink-400">
                                    {format.relativeDate(review.createdAt)}
                                    {review.updatedAt !== review.createdAt
                                        ? ` · ${t("reviews.edited")}`
                                        : ""}
                                </span>
                            </div>

                            {review.content ? (
                                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                                    {review.content}
                                </p>
                            ) : (
                                <p className="mt-2 text-sm italic text-ink-400">
                                    {t("reviews.noText")}
                                </p>
                            )}
                        </div>

                        {mayEdit || mayDelete ? (
                            <div className="flex shrink-0 gap-1">
                                {mayEdit ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditing(true)}
                                        aria-label={t("reviews.editReview")}
                                    >
                                        <Pencil className="size-4" />
                                    </Button>
                                ) : null}
                                {mayDelete ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setConfirming(true)}
                                        aria-label={t("reviews.deleteReview")}
                                        className="text-danger hover:bg-danger-soft"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <ConfirmDialog
                        open={confirming}
                        title={t("reviews.deleteConfirmTitle")}
                        description={t("reviews.deleteConfirmBody")}
                        confirmLabel={t("reviews.deleteReview")}
                        loading={deleteReview.isPending}
                        error={deleteReview.error ? errorMessage(deleteReview.error) : null}
                        onConfirm={() => void handleDelete()}
                        onCancel={() => {
                            deleteReview.reset();
                            setConfirming(false);
                        }}
                    />
                </>
            )}
        </li>
    );
}
