"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useActiveWarnings } from "@/features/moderation/useModeration";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useFormat } from "@/i18n/useFormat";

/**
 * Active warnings for one user.
 *
 * `GET /admin/get-active-warnings/:userId` returns warnings only — there is no
 * endpoint listing bans, so the id of an active ban comes from the user record
 * itself (`moderation.activeBan`).
 */
export function UserWarnings({
    userId,
    canRevoke,
    onRevoke,
}: {
    userId: string;
    canRevoke: boolean;
    onRevoke: (warnId: string) => void;
}) {
    const { t } = useTranslation();
    const format = useFormat();
    const errorMessage = useErrorMessage();
    const { data, isPending, isError, error } = useActiveWarnings(userId);

    if (isPending) {
        return (
            <div className="flex items-center gap-2 py-2 text-sm text-ink-500">
                <Spinner className="size-4" />
                {t("moderation.loadingWarnings")}
            </div>
        );
    }

    if (isError) {
        return <p className="py-2 text-sm text-danger">{errorMessage(error)}</p>;
    }

    if (data.length === 0) {
        return (
            <p className="py-2 text-sm text-ink-500">
                {t("moderation.noActiveWarnings")}
            </p>
        );
    }

    return (
        <ul className="divide-y divide-ink-200">
            {data.map((warning) => (
                <li
                    key={warning._id}
                    className="flex flex-wrap items-start justify-between gap-3 py-2.5"
                >
                    <div className="min-w-0">
                        <p className="text-sm text-ink-800">{warning.reason}</p>
                        <p className="mt-0.5 text-xs text-ink-500">
                            {t("moderation.warningIssued", {
                                date: format.date(warning.createdAt),
                                expiry: warning.expiresAt
                                    ? t("moderation.warningExpires", {
                                            date: format.date(warning.expiresAt),
                                        })
                                    : t("moderation.warningNeverExpires"),
                            })}
                        </p>
                    </div>

                    {canRevoke ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onRevoke(warning._id)}
                        >
                            {t("common.revoke")}
                        </Button>
                    ) : null}
                </li>
            ))}
        </ul>
    );
}
