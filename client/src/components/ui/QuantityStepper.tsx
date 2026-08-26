"use client";

import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export function QuantityStepper({
    value,
    onChange,
    max,
    disabled = false,
    label,
    className,
}: {
    value: number;
    onChange: (value: number) => void;
    max?: number;
    disabled?: boolean;
    /** Defaults to the translated word for "quantity". */
    label?: string;
    className?: string;
}) {
    const { t } = useTranslation();
    const fieldLabel = label ?? t("common.quantity");

    // Quantity never drops below 1: an empty line is a removal, not a zero.
    const canDecrease = !disabled && value > 1;
    const canIncrease = !disabled && (max === undefined || value < max);

    const stepClass =
        "inline-flex size-10 items-center justify-center text-ink-600 transition-colors " +
        "hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 " +
        "disabled:cursor-not-allowed disabled:text-ink-300 disabled:hover:bg-transparent";

    return (
        <div
            className={cn(
                "inline-flex items-center overflow-hidden rounded-xl border border-ink-300 bg-surface",
                className,
            )}
        >
            <button
                type="button"
                className={stepClass}
                onClick={() => onChange(value - 1)}
                disabled={!canDecrease}
                aria-label={t("cart.decrease", { label: fieldLabel })}
            >
                <Minus className="size-4" />
            </button>

            <input
                type="number"
                inputMode="numeric"
                min={1}
                max={max}
                value={value}
                disabled={disabled}
                aria-label={fieldLabel}
                onChange={(event) => {
                    const next = Number(event.target.value);
                    if (Number.isFinite(next)) onChange(Math.trunc(next));
                }}
                className="h-10 w-12 border-x border-ink-200 bg-transparent text-center text-sm font-semibold tabular-nums text-ink-900 outline-none disabled:bg-ink-100"
            />

            <button
                type="button"
                className={stepClass}
                onClick={() => onChange(value + 1)}
                disabled={!canIncrease}
                aria-label={t("cart.increase", { label: fieldLabel })}
            >
                <Plus className="size-4" />
            </button>
        </div>
    );
}
