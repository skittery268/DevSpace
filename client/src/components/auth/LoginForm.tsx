"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthLink } from "./AuthCard";
import { AuthHeading, AuthSplit } from "./AuthSplit";
import { AuthDivider, GoogleButton } from "./GoogleButton";
import { RedirectIfAuthenticated } from "@/components/common/RouteGuard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { useLogin } from "@/features/auth/useAuthMutations";
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
    // Set by the register form while email verification is switched off — the
    // sign-up screen redirects straight here, so this is the only confirmation
    // that the account was actually created.
    const justRegistered = searchParams.get("registered") === "1";

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
        <AuthSplit variant="signIn">
            <AuthHeading title={t("auth.loginTitle")} description={t("auth.loginBody")} />

            {/*
                `flex flex-col gap-4` rather than `space-y-4`: the submit button wants
                a little more air above it than the fields want between them, and a
                `space-y` rule outranks a `mt-*` on the child it targets.
            */}
            <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate>
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                {justRegistered && !formError ? (
                    <Alert tone="success">{t("auth.registeredNotice")}</Alert>
                ) : null}

                <Input
                    type="email"
                    label={t("auth.email")}
                    autoComplete="email"
                    placeholder={t("auth.emailPlaceholder")}
                    leading={<Mail className="size-4.5" aria-hidden />}
                    error={errors.email?.message}
                    {...register("email")}
                />

                <div>
                    <PasswordInput
                        label={t("auth.password")}
                        autoComplete="current-password"
                        placeholder={t("auth.passwordPlaceholder")}
                        leading={<Lock className="size-4.5" aria-hidden />}
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <div className="mt-2 text-right text-xs">
                        <AuthLink href="/forgot-password">
                            {t("auth.forgotPassword")}
                        </AuthLink>
                    </div>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    fullWidth
                    loading={login.isPending}
                    className="mt-2"
                >
                    {t("auth.signIn")}
                </Button>
            </form>

            <AuthDivider className="my-6" />
            <GoogleButton size="lg" label={t("auth.signInWithGoogle")} />
        </AuthSplit>
    );
}

export function LoginForm() {
    return (
        <RedirectIfAuthenticated>
            <LoginFormInner />
        </RedirectIfAuthenticated>
    );
}
