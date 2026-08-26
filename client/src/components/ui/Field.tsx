"use client";

import { Check, Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/**
 * Form controls.
 *
 * All three share one `CONTROL` string so a text input, a textarea and a select
 * line up pixel for pixel. React 19 treats `ref` as an ordinary prop, so
 * `{...register("field")}` from react-hook-form spreads straight through
 * without a `forwardRef` wrapper.
 */
const CONTROL =
    "w-full rounded-lg border bg-surface px-3.5 text-sm text-ink-900 placeholder:text-ink-400 " +
    "transition-[border-color,box-shadow,background-color] duration-200 " +
    "disabled:cursor-not-allowed disabled:bg-ink-100 disabled:text-ink-500";

const CONTROL_OK =
    "border-ink-300 hover:border-ink-400 focus:border-brand-500 " +
    "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-ring)_22%,transparent)]";
const CONTROL_ERROR =
    "border-danger hover:border-danger " +
    "focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-danger)_22%,transparent)]";

interface FieldShellProps {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    required?: boolean;
    htmlFor: string;
    className?: string;
    children: ReactNode;
}

function FieldShell({
    label,
    hint,
    error,
    required,
    htmlFor,
    className,
    children,
}: FieldShellProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            {label ? (
                <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
                    {label}
                    {required ? (
                        <span className="ml-0.5 text-danger" aria-hidden>
                            *
                        </span>
                    ) : null}
                </label>
            ) : null}
            {children}
            {error ? (
                <p
                    id={`${htmlFor}-error`}
                    className="animate-fade flex items-start gap-1 text-xs font-medium text-danger"
                >
                    {error}
                </p>
            ) : hint ? (
                <p id={`${htmlFor}-hint`} className="text-xs text-ink-500">
                    {hint}
                </p>
            ) : null}
        </div>
    );
}

interface InputProps extends Omit<ComponentProps<"input">, "size"> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    wrapperClassName?: string;
    leading?: ReactNode;
    /** Rendered inside the field, right-aligned. Must not be interactive text. */
    trailing?: ReactNode;
}

export function Input({
    label,
    hint,
    error,
    required,
    className,
    wrapperClassName,
    leading,
    trailing,
    id,
    ...rest
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const control = (
        <input
            id={inputId}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
                CONTROL,
                "h-11",
                error ? CONTROL_ERROR : CONTROL_OK,
                leading && "pl-10",
                trailing && "pr-11",
                className,
            )}
            {...rest}
        />
    );

    return (
        <FieldShell
            label={label}
            hint={hint}
            error={error}
            required={required}
            htmlFor={inputId}
            className={wrapperClassName}
        >
            {leading || trailing ? (
                <div className="relative">
                    {leading ? (
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
                            {leading}
                        </span>
                    ) : null}
                    {control}
                    {trailing ? (
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2">
                            {trailing}
                        </span>
                    ) : null}
                </div>
            ) : (
                control
            )}
        </FieldShell>
    );
}

/**
 * A password field with a reveal toggle.
 *
 * The toggle is a real button so it is reachable from the keyboard, and it is
 * excluded from the tab order of long forms only where it would be noise —
 * here it stays focusable, because a password the user cannot verify is the
 * most common cause of a failed sign-in.
 */
export function PasswordInput({
    label,
    hint,
    error,
    ...rest
}: Omit<InputProps, "type" | "trailing">) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);

    return (
        <Input
            {...rest}
            type={visible ? "text" : "password"}
            label={label}
            hint={hint}
            error={error}
            trailing={
                <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    aria-label={visible ? t("common.hidePassword") : t("common.showPassword")}
                    aria-pressed={visible}
                    className="rounded-lg p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
                >
                    {visible ? (
                        <EyeOff className="size-4" aria-hidden />
                    ) : (
                        <Eye className="size-4" aria-hidden />
                    )}
                </button>
            }
        />
    );
}

interface TextareaProps extends ComponentProps<"textarea"> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    wrapperClassName?: string;
}

export function Textarea({
    label,
    hint,
    error,
    required,
    className,
    wrapperClassName,
    id,
    rows = 4,
    ...rest
}: TextareaProps) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
        <FieldShell
            label={label}
            hint={hint}
            error={error}
            required={required}
            htmlFor={textareaId}
            className={wrapperClassName}
        >
            <textarea
                id={textareaId}
                rows={rows}
                required={required}
                aria-invalid={error ? true : undefined}
                aria-describedby={
                    error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined
                }
                className={cn(
                    CONTROL,
                    "resize-y py-2.5 leading-relaxed",
                    error ? CONTROL_ERROR : CONTROL_OK,
                    className,
                )}
                {...rest}
            />
        </FieldShell>
    );
}

interface SelectProps extends ComponentProps<"select"> {
    label?: ReactNode;
    hint?: ReactNode;
    error?: string;
    wrapperClassName?: string;
}

export function Select({
    label,
    hint,
    error,
    required,
    className,
    wrapperClassName,
    id,
    children,
    ...rest
}: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
        <FieldShell
            label={label}
            hint={hint}
            error={error}
            required={required}
            htmlFor={selectId}
            className={wrapperClassName}
        >
            <div className="relative">
                <select
                    id={selectId}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={
                        error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined
                    }
                    className={cn(
                        CONTROL,
                        "h-11 appearance-none pr-10",
                        error ? CONTROL_ERROR : CONTROL_OK,
                        className,
                    )}
                    {...rest}
                >
                    {children}
                </select>
                {/* Drawn in markup rather than as a background image so it inherits
                        the themed text colour instead of carrying a baked-in one. */}
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400"
                >
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
        </FieldShell>
    );
}

/**
 * Checkbox with a drawn box.
 *
 * A native checkbox renders in the browser's own colours, which drift away from
 * the rest of the form in dark mode. The real input stays in the DOM — it is
 * only visually replaced — so keyboard, label and form semantics are untouched.
 */
export function Checkbox({
    label,
    className,
    id,
    ...rest
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode }) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
        <label
            htmlFor={inputId}
            className={cn(
                "group inline-flex cursor-pointer select-none items-center gap-2.5 text-sm text-ink-700",
                rest.disabled && "cursor-not-allowed opacity-60",
                className,
            )}
        >
            <span className="relative inline-flex size-[18px] shrink-0 items-center justify-center">
                <input
                    id={inputId}
                    type="checkbox"
                    className="peer absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                    {...rest}
                />
                <span
                    aria-hidden
                    className={cn(
                        "pointer-events-none flex size-full items-center justify-center rounded-md border border-ink-300 bg-surface text-white",
                        "transition-[background-color,border-color] duration-150",
                        "group-hover:border-ink-400",
                        "peer-checked:border-transparent peer-checked:bg-brand-600 peer-checked:group-hover:border-transparent",
                        // The tick is a descendant, not a sibling, so the peer rule has to
                        // reach into it rather than sit on it.
                        "peer-checked:[&_svg]:opacity-100",
                        "peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500",
                    )}
                >
                    <Check className="size-3 opacity-0 transition-opacity duration-150" />
                </span>
            </span>
            {label}
        </label>
    );
}
