"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

const SIZES = { sm: "size-3.5", md: "size-5", lg: "size-6" } as const;

export function RatingStars({
    value,
    size = "sm",
    className,
}: {
    value: number;
    size?: keyof typeof SIZES;
    className?: string;
}) {
    const { t } = useTranslation();

    return (
        <span
            className={cn("inline-flex items-center gap-0.5", className)}
            role="img"
            aria-label={t("reviews.ratedOutOfFive", { value: value.toFixed(1) })}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    aria-hidden
                    className={cn(
                        SIZES[size],
                        star <= Math.round(value)
                            ? "fill-star text-star"
                            : "fill-transparent text-ink-300",
                    )}
                />
            ))}
        </span>
    );
}

export function RatingInput({
    value,
    onChange,
    disabled = false,
}: {
    value: number;
    onChange: (value: number) => void;
    disabled?: boolean;
}) {
    const { t } = useTranslation();

    // The row previews the rating under the cursor, so the click is confirmed
    // before it happens rather than after.
    const [hovered, setHovered] = useState(0);
    const shown = hovered || value;

    return (
        <div
            className="flex items-center gap-1"
            role="radiogroup"
            aria-label={t("reviews.rating")}
            onMouseLeave={() => setHovered(0)}
        >
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={value === star}
                    aria-label={t("count.stars", { count: star })}
                    disabled={disabled}
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onFocus={() => setHovered(star)}
                    onBlur={() => setHovered(0)}
                    className="rounded-lg p-0.5 transition-transform duration-150 hover:scale-115 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Star
                        className={cn(
                            "size-7 transition-colors duration-150",
                            star <= shown
                                ? "fill-star text-star"
                                : "fill-transparent text-ink-300",
                        )}
                    />
                </button>
            ))}
            <span className="ml-2 text-sm font-medium tabular-nums text-ink-600">
                {shown}/5
            </span>
        </div>
    );
}
