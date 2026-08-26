"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/Badge";
import { orderStatusLabelKey, ORDER_STATUS_TONES } from "@/lib/constants";
import type { OrderStatus } from "@/types/order.types";

const TONE_MAP = {
    neutral: "neutral",
    info: "info",
    success: "success",
    warning: "warning",
    danger: "danger",
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const { t } = useTranslation();

    return (
        <Badge tone={TONE_MAP[ORDER_STATUS_TONES[status]]}>
            {t(orderStatusLabelKey(status))}
        </Badge>
    );
}
