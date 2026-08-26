"use client";

import { MessageSquare } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { RatingStars } from "./RatingStars";
import { ReviewForm } from "./ReviewForm";
import { ReviewItem } from "./ReviewItem";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { SkeletonText } from "@/components/ui/Skeleton";
import { useAuth } from "@/features/auth/useAuth";
import { useProductReviews } from "@/features/reviews/useReviews";
import { canCreateReview } from "@/lib/permissions";

const REVIEWS_PER_PAGE = 10;

export function ReviewSection({ productId }: { productId: string }) {
    const { t } = useTranslation();
    const { user } = useAuth();
    const mayReview = canCreateReview(user);
    const [page, setPage] = useState(1);
    const [writing, setWriting] = useState(false);

    const { data, isPending, isError, error, isFetching, refetch } =
        useProductReviews(productId, page, REVIEWS_PER_PAGE);

    /**
     * The backend stores no average rating and offers no aggregate endpoint, so
     * the only honest figure is the mean of the reviews actually loaded. It is
     * shown as an exact average only when this page holds every review.
     */
    const loaded = data?.items ?? [];
    const average =
        loaded.length > 0
            ? loaded.reduce((sum, review) => sum + review.rating, 0) / loaded.length
            : 0;
    const isCompleteAverage = data ? data.total <= loaded.length : false;

    return (
        <Card>
            <CardHeader
                title={t("reviews.title")}
                description={
                    data
                        ? t("reviews.subtitle", {
                                reviews: t("count.reviews", { count: data.total }),
                            })
                        : t("reviews.loading")
                }
                action={
                    mayReview ? (
                        <Button
                            variant={writing ? "ghost" : "outline"}
                            size="sm"
                            onClick={() => setWriting((value) => !value)}
                        >
                            {writing ? t("reviews.close") : t("reviews.write")}
                        </Button>
                    ) : (
                        <ButtonLink href="/login" variant="outline" size="sm">
                            {t("reviews.signInToReview")}
                        </ButtonLink>
                    )
                }
            />

            {loaded.length > 0 ? (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-ink-200 bg-ink-100 px-5 py-4">
                    <span className="text-3xl font-semibold tracking-tight tabular-nums text-ink-900">
                        {average.toFixed(1)}
                    </span>
                    <div>
                        <RatingStars value={average} size="md" />
                        <p className="mt-1 text-xs text-ink-500">
                            {isCompleteAverage
                                ? t("reviews.averageAcrossAll", {
                                        reviews: t("count.reviews", { count: loaded.length }),
                                    })
                                : t("reviews.averageAcrossPage", { count: loaded.length })}
                        </p>
                    </div>
                </div>
            ) : null}

            <CardBody>
                {writing ? (
                    <div className="animate-rise mb-6 rounded-xl border border-ink-200 bg-ink-100 p-4">
                        <ReviewForm
                            productId={productId}
                            onDone={() => {
                                setWriting(false);
                                setPage(1);
                            }}
                            onCancel={() => setWriting(false)}
                        />
                    </div>
                ) : null}

                {isPending ? (
                    <div className="space-y-6 py-2">
                        <SkeletonText lines={3} />
                        <SkeletonText lines={3} />
                    </div>
                ) : isError ? (
                    <ErrorState error={error} onRetry={() => void refetch()} />
                ) : loaded.length === 0 ? (
                    <EmptyState
                        icon={<MessageSquare className="size-6" />}
                        title={t("reviews.emptyTitle")}
                        description={t("reviews.emptyBody")}
                    />
                ) : (
                    <>
                        <ul className="-my-5">
                            {loaded.map((review) => (
                                <ReviewItem key={review.id} review={review} />
                            ))}
                        </ul>

                        <Pagination
                            className="mt-6"
                            page={data.page}
                            pageCount={data.pageCount}
                            onPageChange={setPage}
                            disabled={isFetching}
                        />
                    </>
                )}
            </CardBody>
        </Card>
    );
}
