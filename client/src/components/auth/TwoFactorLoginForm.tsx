"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthCard, AuthLink } from "./AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useVerify2FALogin } from "@/features/auth/useAuthMutations";
import { applyServerErrors } from "@/lib/form-errors";
import { APP_NAME } from "@/lib/constants";
import {
    createTwoFactorCodeSchema,
    type TwoFactorCodeValues,
} from "@/lib/validation/auth.schemas";

/**
 * The second half of a 2FA sign-in.
 *
 * It runs with no session: the only credential is the `twoFA` cookie the
 * password step (or the Google callback) left behind, which the endpoint reads
 * itself. The form is reachable both from `/login` and from `/?requires2FA=true`.
 */
export function TwoFactorLoginForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const verify = useVerify2FALogin();
    const [formError, setFormError] = useState<string | null>(null);

    const next = searchParams.get("next");

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<TwoFactorCodeValues>({
        resolver: zodResolver(useMemo(() => createTwoFactorCodeSchema(t), [t])),
        defaultValues: { code: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        try {
            await verify.mutateAsync(values.code);
            router.push(next && next.startsWith("/") ? next : "/");
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, ["code"]));
        }
    });

    return (
        <AuthCard
            title={t("auth.twoFactorTitle")}
            description={t("auth.twoFactorBody", { app: APP_NAME })}
            footer={
                <>
                    {t("auth.twoFactorFooter")}{" "}
                    <AuthLink href="/login">{t("auth.startOver")}</AuthLink>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                <Input
                    label={t("auth.authenticationCode")}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-lg tracking-[0.5em]"
                    error={errors.code?.message}
                    {...register("code")}
                />

                <Button type="submit" fullWidth loading={verify.isPending}>
                    {t("auth.verifyAndSignIn")}
                </Button>
            </form>

            <Alert tone="info" className="mt-5">
                {t("auth.twoFactorExpiryNote")}
            </Alert>
        </AuthCard>
    );
}
