"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import { useToastStore, type Toast as ToastModel } from "@/store/toast.store";

const TONES = {
    success: { icon: CheckCircle2, className: "text-success", rail: "bg-success" },
    error: { icon: XCircle, className: "text-danger", rail: "bg-danger" },
    info: { icon: Info, className: "text-info", rail: "bg-info" },
} as const;

function ToastCard({ toast }: { toast: ToastModel }) {
    const { t } = useTranslation();
    const dismiss = useToastStore((state) => state.dismiss);
    const { icon: Icon, className, rail } = TONES[toast.tone];

    useEffect(() => {
        const timeout = window.setTimeout(
            () => dismiss(toast.id),
            toast.tone === "error" ? 7000 : 4000,
        );
        return () => window.clearTimeout(timeout);
    }, [toast.id, toast.tone, dismiss]);

    return (
        <div
            role={toast.tone === "error" ? "alert" : "status"}
            className="animate-rise pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border border-ink-200 bg-surface-2 py-3 pl-4 pr-3 elev-3"
        >
            <span className={cn("absolute left-0 top-0 h-full w-0.5", rail)} aria-hidden />
            <Icon className={cn("mt-0.5 size-4 shrink-0", className)} aria-hidden />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900">{toast.title}</p>
                {toast.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">
                        {toast.description}
                    </p>
                ) : null}
            </div>
            <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label={t("common.dismissNotification")}
                className="-mr-1 rounded-lg p-1 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
            >
                <X className="size-3.5" />
            </button>
        </div>
    );
}

export function ToastViewport() {
    const toasts = useToastStore((state) => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-sm sm:items-end">
            {toasts.map((toast) => (
                <ToastCard key={toast.id} toast={toast} />
            ))}
        </div>
    );
}
