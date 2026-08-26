"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AuthCard, AuthLink } from "./AuthCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { useResetPassword } from "@/features/auth/useAuthMutations";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createResetPasswordSchema,
    type ResetPasswordValues,
} from "@/lib/validation/auth.schemas";
import { toast } from "@/store/toast.store";

export function ResetPasswordForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const resetPassword = useResetPassword();
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<ResetPasswordValues>({
        resolver: zodResolver(useMemo(() => createResetPasswordSchema(t), [t])),
        defaultValues: {
            email: searchParams.get("email") ?? "",
            code: "",
            newPassword: "",
        },
    });

    const onSubmit = handleSubmit(async (values) => {
        setFormError(null);

        try {
            await resetPassword.mutateAsync(values);
            // Resetting does not sign the user in — no cookie is issued here.
            toast.success(
                t("toast.passwordChanged"),
                t("toast.passwordChangedBody"),
            );
            router.push("/login");
        } catch (error) {
            setFormError(
                applyServerErrors(t, error, setError, ["email", "code", "newPassword"]),
            );
        }
    });

    return (
        <AuthCard
            title={t("auth.resetTitle")}
            description={t("auth.resetBody")}
            footer={
                <>
                    {t("auth.resetFooter")}{" "}
                    <AuthLink href="/forgot-password">
                        {t("auth.requestAnother")}
                    </AuthLink>
                </>
            }
        >
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
                {formError ? <Alert tone="error">{formError}</Alert> : null}

                <Input
                    type="email"
                    label={t("auth.email")}
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register("email")}
                />

                <Input
                    label={t("auth.resetCode")}
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="text-center text-lg tracking-[0.5em]"
                    error={errors.code?.message}
                    {...register("code")}
                />

                <PasswordInput
                    label={t("auth.newPassword")}
                    autoComplete="new-password"
                    placeholder={t("auth.passwordPlaceholder")}
                    hint={t("auth.passwordHint")}
                    error={errors.newPassword?.message}
                    {...register("newPassword")}
                />

                <Button type="submit" fullWidth loading={resetPassword.isPending}>
                    {t("auth.changePassword")}
                </Button>
            </form>

            <Alert tone="warning" className="mt-5">
                {t("auth.resetWarning")}
            </Alert>
        </AuthCard>
    );
}
