"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthCard, AuthLink } from "./AuthCard";
import { AuthDivider, GoogleButton } from "./GoogleButton";
import { RedirectIfAuthenticated } from "@/components/common/RouteGuard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { useLogin } from "@/features/auth/useAuthMutations";
import { APP_NAME } from "@/lib/constants";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createLoginSchema,
    type LoginValues,
} from "@/lib/validation/auth.schemas";

function LoginFormInner() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const login = useLogin();
    const [formError, setFormError] = useState<string | null>(null);

    const next = searchParams.get("next");

    // Rebuilt only when the language changes, so the messages a rule produces
    // follow the switcher without the form remounting.
    const schema = useMemo(() => createLoginSchema(t), [t]);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LoginValues>({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        try {
            const result = await login.mutateAsync(values);

            // The password step only issues a short-lived `twoFA` cookie when 2FA is
            // on; the real session comes from the code step.
            if (result.requires2FA) {
                router.push(
                    next ? `/two-factor?next=${encodeURIComponent(next)}` : "/two-factor",
                );
                return;
            }

            router.push(next && next.startsWith("/") ? next : "/");
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, ["email", "password"]));
        }
    });

    return (
        <AuthCard
            title={t("auth.loginTitle")}
            description={t("auth.loginBody")}
            footer={
                <>
                    {t("auth.loginFooter", { app: APP_NAME })}{" "}
                    <AuthLink href="/register">{t("auth.signUp")}</AuthLink>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                <Input
                    type="email"
                    label={t("auth.email")}
                    autoComplete="email"
                    placeholder={t("auth.emailPlaceholder")}
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div>
                    <PasswordInput
                        label={t("auth.password")}
                        autoComplete="current-password"
                        placeholder={t("auth.passwordPlaceholder")}
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <div className="mt-1.5 text-right">
                        <AuthLink href="/forgot-password">
                            {t("auth.forgotPassword")}
                        </AuthLink>
                    </div>
                </div>

                <Button type="submit" fullWidth loading={login.isPending}>
                    {t("auth.signIn")}
                </Button>
            </form>

            <AuthDivider />
            <GoogleButton label={t("auth.signInWithGoogle")} />
        </AuthCard>
    );
}

export function LoginForm() {
    return (
        <RedirectIfAuthenticated>
            <LoginFormInner />
        </RedirectIfAuthenticated>
    );
}
