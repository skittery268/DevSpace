import {
    AlertTriangle,
    CheckCircle2,
    Info,
    XCircle,
    type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "error";

const TONES: Record<AlertTone, { box: string; icon: LucideIcon; iconClass: string }> = {
    info: {
        box: "border-info-line bg-info-soft text-info-strong",
        icon: Info,
        iconClass: "text-info",
    },
    success: {
        box: "border-success-line bg-success-soft text-success-strong",
        icon: CheckCircle2,
        iconClass: "text-success",
    },
    warning: {
        box: "border-warning-line bg-warning-soft text-warning-strong",
        icon: AlertTriangle,
        iconClass: "text-warning",
    },
    error: {
        box: "border-danger-line bg-danger-soft text-danger-strong",
        icon: XCircle,
        iconClass: "text-danger",
    },
};

export function Alert({
    tone = "info",
    title,
    children,
    className,
}: {
    tone?: AlertTone;
    title?: ReactNode;
    children?: ReactNode;
    className?: string;
}) {
    const { box, icon: Icon, iconClass } = TONES[tone];

    return (
        <div
            role={tone === "error" ? "alert" : "status"}
            className={cn(
                "animate-fade flex gap-3 rounded-xl border px-4 py-3 text-sm",
                box,
                className,
            )}
        >
            <Icon className={cn("mt-0.5 size-4 shrink-0", iconClass)} aria-hidden />
            <div className="min-w-0 flex-1">
                {title ? <p className="font-semibold">{title}</p> : null}
                {children ? (
                    <div className={cn(title && "mt-0.5", "leading-relaxed")}>{children}</div>
                ) : null}
            </div>
        </div>
    );
}
