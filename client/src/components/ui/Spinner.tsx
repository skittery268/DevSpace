"use client";

import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
    const { t } = useTranslation();

    return (
        <span
            role="status"
            aria-label={t("states.loading")}
            className={cn(
                "inline-block size-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent",
                className,
            )}
        />
    );
}

