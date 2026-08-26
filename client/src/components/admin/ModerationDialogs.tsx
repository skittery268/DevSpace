"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import {
    useBanUser,
    useUnBanUser,
    useUnWarnUser,
    useWarnUser,
} from "@/features/moderation/useModeration";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createRevokeSanctionSchema,
    createSanctionSchema,
    type RevokeSanctionValues,
    type SanctionOutput,
    type SanctionValues,
} from "@/lib/validation/moderation.schemas";
import { toast } from "@/store/toast.store";
import type { ApiUser } from "@/types/user.types";

import { useMemo, useState } from "react";

/** Warn or ban: same payload shape, different endpoint. */
export function SanctionDialog({
    open,
    kind,
    user,
    onClose,
}: {
    open: boolean;
    kind: "warn" | "ban";
    user: ApiUser | null;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const warnUser = useWarnUser();
    const banUser = useBanUser();
    const [formError, setFormError] = useState<string | null>(null);

    const mutation = kind === "warn" ? warnUser : banUser;

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<SanctionValues, unknown, SanctionOutput>({
        resolver: zodResolver(useMemo(() => createSanctionSchema(t), [t])),
        defaultValues: { reason: "", duration: "" },
    });

    const close = () => {
        reset();
        setFormError(null);
        mutation.reset();
        onClose();
    };

    const onSubmit = handleSubmit(async (values) => {
        if (!user) return;
        setFormError(null);

        const expiresAt =
            values.duration === "" ? undefined : Number(values.duration);

        try {
            if (kind === "warn") {
                const result = await warnUser.mutateAsync({
                    userId: user._id,
                    reason: values.reason,
                    expiresAt,
                });
                // Three active warnings auto-issue a 10-day system ban, and the
                // response then carries the ban rather than the warning.
                if (result.type === "ban") {
                    toast.error(
                        t("toast.warningEscalated"),
                        t("toast.warningEscalatedBody"),
                    );
                } else {
                    toast.success(t("toast.userWarned"), user.fullname);
                }
            } else {
                await banUser.mutateAsync({
                    userId: user._id,
                    reason: values.reason,
                    expiresAt,
                });
                toast.success(t("toast.userBanned"), user.fullname);
            }
            close();
        } catch (error) {
            setFormError(
                applyServerErrors(t, error, setError, ["reason", "duration"]),
            );
        }
    });

    return (
        <Modal
            open={open}
            onClose={close}
            title={
                kind === "warn" ? t("moderation.warnTitle") : t("moderation.banTitle")
            }
            description={user ? `${user.fullname} · ${user.email}` : undefined}
            footer={
                <>
                    <Button variant="ghost" onClick={close} disabled={mutation.isPending}>
                        {t("common.cancel")}
                    </Button>
                    <Button
                        variant={kind === "ban" ? "danger" : "primary"}
                        onClick={() => void onSubmit()}
                        loading={mutation.isPending}
                    >
                        {kind === "warn"
                            ? t("moderation.issueWarning")
                            : t("moderation.issueBan")}
                    </Button>
                </>
            }
        >
            <form
                onSubmit={onSubmit}
                className="space-y-4"
                noValidate
                id={`sanction-${kind}`}
            >
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                <Textarea
                    label={t("moderation.reason")}
                    required
                    rows={3}
                    placeholder={t("moderation.reasonPlaceholder")}
                    hint={t("moderation.reasonHint")}
                    error={errors.reason?.message}
                    {...register("reason")}
                />

                <Input
                    type="number"
                    min={1}
                    step={1}
                    label={t("moderation.duration")}
                    placeholder={t("moderation.durationPlaceholder")}
                    hint={t("moderation.durationHint")}
                    error={errors.duration?.message}
                    {...register("duration")}
                />

                {kind === "warn" ? (
                    <Alert tone="warning">{t("moderation.warnWarning")}</Alert>
                ) : (
                    <Alert tone="warning">{t("moderation.banWarning")}</Alert>
                )}
            </form>
        </Modal>
    );
}

/** Unban or unwarn: both need only a reason plus the id of the target action. */
export function RevokeSanctionDialog({
    open,
    kind,
    user,
    actionId,
    onClose,
}: {
    open: boolean;
    kind: "unban" | "unwarn";
    user: ApiUser | null;
    actionId: string | null;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const unBanUser = useUnBanUser();
    const unWarnUser = useUnWarnUser();
    const [formError, setFormError] = useState<string | null>(null);

    const mutation = kind === "unban" ? unBanUser : unWarnUser;

    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors },
    } = useForm<RevokeSanctionValues>({
        resolver: zodResolver(useMemo(() => createRevokeSanctionSchema(t), [t])),
        defaultValues: { reason: "" },
    });

    const close = () => {
        reset();
        setFormError(null);
        mutation.reset();
        onClose();
    };

    const onSubmit = handleSubmit(async (values) => {
        if (!user || !actionId) return;
        setFormError(null);

        try {
            if (kind === "unban") {
                await unBanUser.mutateAsync({
                    userId: user._id,
                    banId: actionId,
                    reason: values.reason,
                });
                toast.success(t("toast.banLifted"), user.fullname);
            } else {
                await unWarnUser.mutateAsync({
                    userId: user._id,
                    warnId: actionId,
                    reason: values.reason,
                });
                toast.success(t("toast.warningRevoked"), user.fullname);
            }
            close();
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, ["reason"]));
        }
    });

    return (
        <Modal
            open={open}
            onClose={close}
            title={
                kind === "unban"
                    ? t("moderation.unbanTitle")
                    : t("moderation.unwarnTitle")
            }
            description={user ? `${user.fullname} · ${user.email}` : undefined}
            footer={
                <>
                    <Button variant="ghost" onClick={close} disabled={mutation.isPending}>
                        {t("common.cancel")}
                    </Button>
                    <Button onClick={() => void onSubmit()} loading={mutation.isPending}>
                        {kind === "unban"
                            ? t("moderation.liftBan")
                            : t("moderation.revokeWarning")}
                    </Button>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                <Textarea
                    label={t("moderation.reason")}
                    required
                    rows={3}
                    placeholder={t("moderation.revokeReasonPlaceholder")}
                    hint={t("moderation.revokeReasonHint")}
                    error={errors.reason?.message}
                    {...register("reason")}
                />
            </form>
        </Modal>
    );
}
