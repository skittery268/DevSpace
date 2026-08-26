"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/Badge";

/** The attribute names a category permits on its products. */
export function AttributeChips({ values }: { values: string[] }) {
    const { t } = useTranslation();

    if (values.length === 0) {
        return <span className="text-xs text-ink-400">{t("common.none")}</span>;
    }

    return (
        <div className="flex flex-wrap gap-1">
            {values.map((value) => (
                <Badge key={value}>{value}</Badge>
            ))}
        </div>
    );
}
