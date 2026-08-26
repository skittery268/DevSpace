"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "./Alert";
import { Button, type ButtonVariant } from "./Button";
import { Modal } from "./Modal";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description?: ReactNode;
    /** Defaults to the translated word for "confirm". */
    confirmLabel?: string;
    /** Defaults to the translated word for "cancel". */
    cancelLabel?: string;
    confirmVariant?: ButtonVariant;
    loading?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onCancel: () => void;
    children?: ReactNode;
}

/** Every destructive action in the app funnels through this dialog. */
export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    confirmVariant = "danger",
    loading = false,
    error,
    onConfirm,
    onCancel,
    children,
}: ConfirmDialogProps) {
    const { t } = useTranslation();

    return (
        <Modal
            open={open}
            onClose={onCancel}
            busy={loading}
            size="sm"
            title={title}
            description={description}
            footer={
                <>
                    <Button variant="ghost" onClick={onCancel} disabled={loading}>
                        {cancelLabel ?? t("common.cancel")}
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
                        {confirmLabel ?? t("common.confirm")}
                    </Button>
                </>
            }
        >
            {/* Passing nothing rather than an empty fragment: Modal skips its body
                    padding entirely, so a dialog that is only a question has no blank
                    band between the title and the buttons. */}
            {error || children ? (
                <>
                    {error ? (
                        <Alert tone="error" className="mb-3">
                            {error}
                        </Alert>
                    ) : null}
                    {children}
                </>
            ) : undefined}
        </Modal>
    );
}
