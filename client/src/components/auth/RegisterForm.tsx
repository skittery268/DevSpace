"use client";

import { MailCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthCard, AuthLink } from "./AuthCard";
import { AuthDivider, GoogleButton } from "./GoogleButton";
import { RedirectIfAuthenticated } from "@/components/common/RouteGuard";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { useRegister } from "@/features/auth/useAuthMutations";
import { APP_NAME } from "@/lib/constants";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createRegisterSchema,
    type RegisterValues,
} from "@/lib/validation/auth.schemas";

function RegisterFormInner() {
    const { t } = useTranslation();
    const registerUser = useRegister();
    const [formError, setFormError] = useState<string | null>(null);
    const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(useMemo(() => createRegisterSchema(t), [t])),
        defaultValues: { fullname: "", email: "", password: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        try {
            await registerUser.mutateAsync(values);
            // Registration issues no session cookie: the account stays unusable
            // until the emailed verification link is opened.
            setRegisteredEmail(values.email);
        } catch (error) {
            setFormError(
                applyServerErrors(t, error, setError, ["fullname", "email", "password"]),
            );
        }
    });

    if (registeredEmail) {
        return (
            <AuthCard
                title={t("auth.verifyTitle")}
                description={
                    <Trans
                        i18nKey="auth.verifyBody"
                        values={{ email: registeredEmail }}
                        components={[<span key="0" className="font-medium text-ink-800" />]}
                    />
                }
            >
                <Alert tone="info" title={t("auth.verifyAlertTitle")}>
                    <p>{t("auth.verifyAlertBody")}</p>
                    <p className="mt-2">{t("auth.verifyAlertResend")}</p>
                </Alert>

                <div className="mt-5 flex flex-col gap-2">
                    <ButtonLink href="/login" fullWidth>
                        <MailCheck className="size-4" />
                        {t("auth.verifiedSignIn")}
                    </ButtonLink>
                    <ButtonLink href="/products" variant="ghost" fullWidth>
                        {t("auth.keepBrowsing")}
                    </ButtonLink>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title={t("auth.registerTitle")}
            description={t("auth.registerBody", { app: APP_NAME })}
            footer={
                <>
                    {t("auth.registerFooter")}{" "}
                    <AuthLink href="/login">{t("auth.signIn")}</AuthLink>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                <Input
                    label={t("auth.fullName")}
                    autoComplete="name"
                    placeholder={t("auth.fullNamePlaceholder")}
                    hint={t("auth.fullNameHint")}
                    error={errors.fullname?.message}
                    {...register("fullname")}
                />

                <Input
                    type="email"
                    label={t("auth.email")}
                    autoComplete="email"
                    placeholder={t("auth.emailPlaceholder")}
                    error={errors.email?.message}
                    {...register("email")}
                />

                <PasswordInput
                    label={t("auth.password")}
                    autoComplete="new-password"
                    placeholder={t("auth.passwordPlaceholder")}
                    hint={t("auth.passwordHint")}
                    error={errors.password?.message}
                    {...register("password")}
                />

                <Button type="submit" fullWidth loading={registerUser.isPending}>
                    {t("auth.signUp")}
                </Button>
            </form>

            <AuthDivider />
            <GoogleButton label={t("auth.signUpWithGoogle")} />
        </AuthCard>
    );
}

export function RegisterForm() {
    return (
        <RedirectIfAuthenticated>
            <RegisterFormInner />
        </RedirectIfAuthenticated>
    );
}
