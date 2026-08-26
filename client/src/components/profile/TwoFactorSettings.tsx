"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ShieldCheck, ShieldOff } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input, PasswordInput } from "@/components/ui/Field";
import {
    useDisable2FA,
    useSetup2FA,
    useVerify2FASetup,
} from "@/features/auth/useAuthMutations";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createPasswordConfirmSchema,
    createTwoFactorCodeSchema,
    type PasswordConfirmValues,
    type TwoFactorCodeValues,
} from "@/lib/validation/auth.schemas";
import { toast } from "@/store/toast.store";
import type { ApiUser } from "@/types/user.types";

/**
 * TOTP setup and removal.
 *
 * Both endpoints re-check the account password, which a Google-provisioned
 * account does not have — the backend calls `comparePassword` unconditionally
 * and would fail there. So the controls are replaced with an explanation for
 * those accounts rather than offering an action that cannot succeed.
 */
export function TwoFactorSettings({ user }: { user: ApiUser }) {
    const { t } = useTranslation();
    const [qrcode, setQrcode] = useState<string | null>(null);
    const [setupError, setSetupError] = useState<string | null>(null);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [disableError, setDisableError] = useState<string | null>(null);
    const [disabling, setDisabling] = useState(false);

    const setup = useSetup2FA();
    const verifySetup = useVerify2FASetup();
    const disable = useDisable2FA();

    const passwordSchema = useMemo(() => createPasswordConfirmSchema(t), [t]);
    const codeSchema = useMemo(() => createTwoFactorCodeSchema(t), [t]);

    const setupForm = useForm<PasswordConfirmValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "" },
    });

    const verifyForm = useForm<TwoFactorCodeValues>({
        resolver: zodResolver(codeSchema),
        defaultValues: { code: "" },
    });

    const disableForm = useForm<PasswordConfirmValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: { password: "" },
    });

    if (user.provider === "google") {
        return (
            <Card>
                <CardHeader
                    title={t("twoFactor.title")}
                    description={t("twoFactor.subtitle")}
                />
                <CardBody>
                    <Alert tone="info" title={t("twoFactor.googleTitle")}>
                        {t("twoFactor.googleBody")}
                    </Alert>
                </CardBody>
            </Card>
        );
    }

    if (user.twoFactorEnabled) {
        const onDisable = disableForm.handleSubmit(async (values) => {
            setDisableError(null);
            try {
                await disable.mutateAsync(values.password);
                toast.success(t("toast.twoFactorDisabled"));
                disableForm.reset();
                setDisabling(false);
            } catch (error) {
                setDisableError(
                    applyServerErrors(t, error, disableForm.setError, ["password"]),
                );
            }
        });

        return (
            <Card>
                <CardHeader
                    title={t("twoFactor.title")}
                    description={t("twoFactor.subtitle")}
                    action={<Badge tone="success">{t("twoFactor.enabled")}</Badge>}
                />
                <CardBody>
                    {disabling ? (
                        <form onSubmit={onDisable} className="space-y-4" noValidate>
                            {disableError ? <Alert tone="error">{disableError}</Alert> : null}
                            <PasswordInput
                                label={t("twoFactor.confirmPassword")}
                                autoComplete="current-password"
                                error={disableForm.formState.errors.password?.message}
                                {...disableForm.register("password")}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" variant="danger" loading={disable.isPending}>
                                    <ShieldOff className="size-4" />
                                    {t("twoFactor.turnOff2FA")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setDisabling(false);
                                        setDisableError(null);
                                        disableForm.reset();
                                    }}
                                    disabled={disable.isPending}
                                >
                                    {t("common.cancel")}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-ink-600">
                                {t("twoFactor.enabledBody")}
                            </p>
                            <Button variant="outline" onClick={() => setDisabling(true)}>
                                {t("twoFactor.turnOff")}
                            </Button>
                        </div>
                    )}
                </CardBody>
            </Card>
        );
    }

    const onStartSetup = setupForm.handleSubmit(async (values) => {
        setSetupError(null);
        try {
            const dataUrl = await setup.mutateAsync(values.password);
            setQrcode(dataUrl);
            setupForm.reset();
        } catch (error) {
            setSetupError(
                applyServerErrors(t, error, setupForm.setError, ["password"]),
            );
        }
    });

    const onConfirmSetup = verifyForm.handleSubmit(async (values) => {
        setVerifyError(null);
        try {
            await verifySetup.mutateAsync(values.code);
            toast.success(t("toast.twoFactorEnabled"));
            setQrcode(null);
            verifyForm.reset();
        } catch (error) {
            setVerifyError(applyServerErrors(t, error, verifyForm.setError, ["code"]));
        }
    });

    return (
        <Card>
            <CardHeader
                title={t("twoFactor.title")}
                description={t("twoFactor.subtitle")}
                action={<Badge tone="neutral">{t("twoFactor.off")}</Badge>}
            />
            <CardBody className="space-y-4">
                {qrcode ? (
                    <>
                        <p className="text-sm text-ink-600">{t("twoFactor.scanBody")}</p>

                        <div className="flex justify-center rounded-lg border border-ink-200 bg-surface p-4">
                            {/* The endpoint returns a data: URL, which the optimizer cannot process. */}
                            <Image
                                src={qrcode}
                                alt={t("twoFactor.qrAlt")}
                                width={200}
                                height={200}
                                unoptimized
                            />
                        </div>

                        <form onSubmit={onConfirmSetup} className="space-y-4" noValidate>
                            {verifyError ? <Alert tone="error">{verifyError}</Alert> : null}
                            <Input
                                label={t("twoFactor.codeFromApp")}
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="000000"
                                className="text-center text-lg tracking-[0.5em]"
                                error={verifyForm.formState.errors.code?.message}
                                {...verifyForm.register("code")}
                            />
                            <div className="flex gap-2">
                                <Button type="submit" loading={verifySetup.isPending}>
                                    <ShieldCheck className="size-4" />
                                    {t("twoFactor.confirmAndEnable")}
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setQrcode(null);
                                        setVerifyError(null);
                                        verifyForm.reset();
                                    }}
                                    disabled={verifySetup.isPending}
                                >
                                    {t("common.cancel")}
                                </Button>
                            </div>
                        </form>

                        <Alert tone="warning">{t("twoFactor.noBackupCodes")}</Alert>
                    </>
                ) : (
                    <form onSubmit={onStartSetup} className="space-y-4" noValidate>
                        {setupError ? <Alert tone="error">{setupError}</Alert> : null}
                        <PasswordInput
                            label={t("twoFactor.confirmPasswordToBegin")}
                            autoComplete="current-password"
                            error={setupForm.formState.errors.password?.message}
                            {...setupForm.register("password")}
                        />
                        <Button type="submit" loading={setup.isPending}>
                            <ShieldCheck className="size-4" />
                            {t("twoFactor.setUp")}
                        </Button>
                    </form>
                )}
            </CardBody>
        </Card>
    );
}
