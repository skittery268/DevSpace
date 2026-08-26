"use client";

import { useId, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { Alert } from "./Alert";
import { Button, type ButtonVariant } from "./Button";
import { Modal, type ModalSize } from "./Modal";

interface FormModalProps {
    open: boolean;
    /** Ignored while `pending` — Modal refuses to close mid-request. */
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    submitLabel: string;
    /** Defaults to the translated word for "cancel". */
    cancelLabel?: string;
    submitVariant?: ButtonVariant;
    /** A form-level failure: the API error, or a rule the schema cannot express. */
    error?: string | null;
    pending?: boolean;
    size?: ModalSize;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    className?: string;
}

/**
 * The one dialog every create/edit form in the app is rendered in.
 *
 * It owns the parts that are identical everywhere — the error banner, the
 * Cancel/Save row, the disabled and loading states, and the guard that keeps a
 * dialog open while its request is still running — so an entity form only ever
 * has to describe its own fields.
 *
 * The submit button lives in the dialog footer, outside the `<form>`, and is
 * wired back to it with the `form` attribute. That keeps Enter-to-submit
 * working without the footer having to reach into the form's state.
 */
export function FormModal({
    open,
    onClose,
    title,
    description,
    children,
    submitLabel,
    cancelLabel,
    submitVariant = "primary",
    error,
    pending = false,
    size = "lg",
    onSubmit,
    className,
}: FormModalProps) {
    const { t } = useTranslation();
    const formId = useId();

    return (
        <Modal
            open={open}
            onClose={onClose}
            busy={pending}
            size={size}
            title={title}
            description={description}
            footer={
                <>
                    <Button variant="ghost" onClick={onClose} disabled={pending}>
                        {cancelLabel ?? t("common.cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        variant={submitVariant}
                        loading={pending}
                    >
                        {submitLabel}
                    </Button>
                </>
            }
        >
            <form
                id={formId}
                onSubmit={onSubmit}
                noValidate
                className={cn("space-y-5", className)}
            >
                {error ? <Alert tone="error">{error}</Alert> : null}
                {children}
            </form>
        </Modal>
    );
}

/**
 * A labelled group of fields inside a dialog.
 *
 * The page forms used a stack of `Card`s for this. A card inside a dialog is a
 * box inside a box, so the grouping is carried by a hairline rule and a small
 * caps label instead — same reading order, far less chrome.
 */
export function FormSection({
    title,
    description,
    children,
    className,
}: {
    title: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                "border-t border-ink-200 pt-5 first:border-0 first:pt-0",
                className,
            )}
        >
            <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500">
                {title}
            </h3>
            {description ? (
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{description}</p>
            ) : null}
            <div className="mt-3.5 space-y-4">{children}</div>
        </section>
    );
}
