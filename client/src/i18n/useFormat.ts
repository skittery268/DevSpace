"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { CURRENCY } from "@/lib/constants";
import { INTL_LOCALES } from "./config";
import { useLocale } from "./useLocale";

const EM_DASH = "—";

function toDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Locale-aware number, currency and date formatting.
 *
 * A hook rather than the module-level `Intl` formatters this replaced: the
 * server renders several requests at once and they may be in different
 * languages, so "the current locale" can never be a module variable. Taking it
 * from context means every render — server or client — formats with the locale
 * that render is actually for.
 */
export function useFormat() {
    const { locale } = useLocale();
    const { t } = useTranslation();
    const tag = INTL_LOCALES[locale];

    return useMemo(() => {
        const price = new Intl.NumberFormat(tag, {
            style: "currency",
            currency: CURRENCY,
        });
        const number = new Intl.NumberFormat(tag);
        const date = new Intl.DateTimeFormat(tag, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        const dateTime = new Intl.DateTimeFormat(tag, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
        // `numeric: "auto"` is what turns "1 day ago" into "yesterday" — and into
        // the equivalent idiom in Russian and Georgian, which no hand-written
        // template could produce.
        const relative = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });

        const formatDate = (value: string | Date | null | undefined) => {
            const parsed = toDate(value);
            return parsed ? date.format(parsed) : EM_DASH;
        };

        return {
            price: (value: number) =>
                price.format(Number.isFinite(value) ? value : 0),
            number: (value: number) => number.format(Number.isFinite(value) ? value : 0),
            date: formatDate,
            dateTime: (value: string | Date | null | undefined) => {
                const parsed = toDate(value);
                return parsed ? dateTime.format(parsed) : EM_DASH;
            },
            relativeDate: (value: string | Date) => {
                const parsed = toDate(value);
                if (!parsed) return EM_DASH;

                const diffMs = Date.now() - parsed.getTime();
                const diffDays = Math.round(diffMs / 86_400_000);

                if (Math.abs(diffDays) < 1) {
                    const diffHours = Math.round(diffMs / 3_600_000);
                    if (Math.abs(diffHours) < 1) return t("common.justNow");
                    return relative.format(-diffHours, "hour");
                }
                if (diffDays < 30) return relative.format(-diffDays, "day");
                return formatDate(parsed);
            },
        };
    }, [tag, t]);
}
