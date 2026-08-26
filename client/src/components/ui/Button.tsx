import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "soft"
    | "ghost"
    | "danger"
    | "outline"
    | "subtle";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

/**
 * `active:scale` is the whole micro-interaction: it costs one composited
 * transform, it is instantly legible, and `prefers-reduced-motion` neutralises
 * it through the global transition override in globals.css.
 */
const BASE =
    "relative inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium tracking-[-0.005em] " +
    "transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out " +
    "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

const VARIANTS: Record<ButtonVariant, string> = {
    // Solid emerald with a hairline highlight along the top edge. A gradient on
    // every button is the fastest way to make an interface look generated — the
    // one gradient in the system is spent on the hero instead.
    primary:
        "brand-fill hover:bg-brand-700 active:bg-brand-800 disabled:shadow-none",
    secondary:
        "bg-ink-900 text-ink-50 elev-1 hover:bg-ink-800 active:bg-ink-700",
    // Brand-tinted, but quiet enough to repeat across a grid of cards without
    // the page turning into a wall of emerald.
    soft: "bg-brand-soft text-link hover:bg-brand-soft-hover active:brightness-95",
    outline:
        "border border-ink-300 bg-surface text-ink-800 hover:border-brand-300 hover:bg-brand-soft hover:text-link active:bg-brand-soft-hover",
    subtle: "bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300",
    ghost: "text-ink-600 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200",
    danger:
        "bg-danger-solid text-white elev-1 hover:bg-danger-solid-hover active:brightness-95",
};

const SIZES: Record<ButtonSize, string> = {
    sm: "h-9 px-3.5 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-[0.9375rem]",
    icon: "size-10 p-0",
};

interface CommonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
}

function buttonClasses({
    variant = "primary",
    size = "md",
    fullWidth,
    className,
}: CommonProps = {}) {
    return cn(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
}

interface ButtonProps extends ComponentProps<"button">, CommonProps {
    loading?: boolean;
}

export function Button({
    variant,
    size,
    fullWidth,
    className,
    loading = false,
    disabled,
    children,
    type = "button",
    ...rest
}: ButtonProps) {
    return (
        <button
            type={type}
            className={buttonClasses({ variant, size, fullWidth, className })}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...rest}
        >
            {loading ? <Spinner className="size-4" /> : null}
            {children}
        </button>
    );
}

interface ButtonLinkProps extends ComponentProps<typeof Link>, CommonProps {
    children: ReactNode;
}

export function ButtonLink({
    variant,
    size,
    fullWidth,
    className,
    children,
    ...rest
}: ButtonLinkProps) {
    return (
        <Link
            className={buttonClasses({ variant, size, fullWidth, className })}
            {...rest}
        >
            {children}
        </Link>
    );
}

