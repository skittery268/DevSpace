"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthCard, AuthLink } from "./AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { useForgotPassword } from "@/features/auth/useAuthMutations";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createForgotPasswordSchema,
    type ForgotPasswordValues,
} from "@/lib/validation/auth.schemas";

export function ForgotPasswordForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const forgotPassword = useForgotPassword();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ForgotPasswordValues>({
        resolver: zodResolver(useMemo(() => createForgotPasswordSchema(t), [t])),
        defaultValues: { email: "" },
    });

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        try {
            await forgotPassword.mutateAsync(values.email);
            // The endpoint answers 200 whether or not the address exists, so the
            // next screen is reached the same way either way.
            router.push(`/reset-password?email=${encodeURIComponent(values.email)}`);
        } catch (error) {
            setFormError(applyServerErrors(t, error, setError, ["email"]));
        }
    });

    return (
        <AuthCard
            title={t("auth.forgotTitle")}
            description={t("auth.forgotBody")}
            footer={
                <>
                    {t("auth.forgotFooter")}{" "}
                    <AuthLink href="/login">{t("auth.backToSignIn")}</AuthLink>
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

                <Button type="submit" fullWidth loading={forgotPassword.isPending}>
                    {t("auth.sendResetCode")}
                </Button>
            </form>

            <Alert tone="info" className="mt-5">
                {t("auth.forgotPrivacyNote")}
            </Alert>
        </AuthCard>
    );
}
