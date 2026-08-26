"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

export type ModalSize = "sm" | "md" | "lg" | "xl";

/**
 * Width is a prop rather than a `className` override so the handful of widths
 * the app actually uses stay a closed set: a confirmation and a product form
 * should not be free to invent their own.
 */
const SIZES: Record<ModalSize, string> = {
    sm: "sm:max-w-md",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-3xl",
};

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title: ReactNode;
    description?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    className?: string;
    size?: ModalSize;
    /**
     * A request is in flight. Escape, the backdrop and the ✕ all stop closing the
     * dialog, so a half-finished write cannot be dismissed by a stray click.
     */
    busy?: boolean;
}

const FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
    size = "md",
    busy = false,
}: ModalProps) {
    const { t } = useTranslation();
    const panelRef = useRef<HTMLDivElement>(null);

    /**
     * The overlay is portalled to `<body>`, not rendered where the dialog is
     * declared.
     *
     * `z-50` only outranks the header's `z-40` inside the same stacking context,
     * and the page sits inside one: `PageTransition` wraps it in `.animate-fade`,
     * whose `animation-fill-mode: both` keeps an opacity animation applied for
     * good. That makes a stacking context on an unpositioned element, so
     * everything inside it — the dialog included — paints in the block layer,
     * underneath the sticky header. The portal steps outside that entirely, and
     * keeps working whatever a future page wraps itself in.
     *
     * `null` on the server, where there is no `document`; every dialog in the app
     * is opened by a click, so nothing is ever portalled during SSR.
     */
    const [container] = useState<HTMLElement | null>(() =>
        typeof document === "undefined" ? null : document.body,
    );

    // Read from event handlers only, so the open/close effect below does not have
    // to re-run — and steal focus — every time a mutation flips `busy`.
    const busyRef = useRef(busy);
    useEffect(() => {
        busyRef.current = busy;
    }, [busy]);

    const requestClose = useCallback(() => {
        if (busyRef.current) return;
        onClose();
    }, [onClose]);

    /** Keeps Tab inside the dialog, which is what `aria-modal` promises. */
    const trapFocus = useCallback((event: KeyboardEvent) => {
        if (event.key !== "Tab") return;
        const panel = panelRef.current;
        if (!panel) return;

        const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (item) => item.offsetParent !== null,
        );
        if (items.length === 0) return;

        const first = items[0];
        const last = items[items.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || active === panel)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }, []);

    useEffect(() => {
        if (!open || !container) return;

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") requestClose();
            trapFocus(event);
        };

        // Where focus goes back to once the dialog closes.
        const opener = document.activeElement as HTMLElement | null;

        document.addEventListener("keydown", onKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        panelRef.current?.focus();

        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = previousOverflow;
            opener?.focus?.();
        };
    }, [open, container, requestClose, trapFocus]);

    if (!open || !container) return null;

    return createPortal(
        <div
            className="animate-fade fixed inset-0 z-50 flex items-end justify-center bg-scrim/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) requestClose();
            }}
        >
            {/* A column rather than one scrolling box: the title and the Cancel/Save
                    row stay put while a long form scrolls between them. */}
            <div
                ref={panelRef}
                role="dialog"
                aria-modal="true"
                aria-label={typeof title === "string" ? title : undefined}
                aria-busy={busy || undefined}
                tabIndex={-1}
                className={cn(
                    "animate-scale-in flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-ink-200 bg-surface-2 elev-3 outline-none",
                    "sm:max-h-[90vh] sm:rounded-xl",
                    SIZES[size],
                    className,
                )}
            >
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-200 px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="text-base font-semibold tracking-tight text-ink-900">
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-1 text-sm leading-relaxed text-ink-500">
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        onClick={requestClose}
                        disabled={busy}
                        aria-label={t("common.closeDialog")}
                        className="-mr-1 rounded-lg p-1.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {children ? (
                    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
                ) : null}

                {footer ? (
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-ink-200 bg-surface-2 px-5 py-3">
                        {footer}
                    </div>
                ) : null}
            </div>
        </div>,
        container,
    );
}
