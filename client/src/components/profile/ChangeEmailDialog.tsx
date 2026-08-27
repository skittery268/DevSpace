"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { FormModal } from "@/components/ui/FormModal";
import { Modal } from "@/components/ui/Modal";
import {
    useRequestEmailChangeCode,
    useVerifyEmailChange,
} from "@/features/account/useAccount";
import { useLogout } from "@/features/auth/useAuthMutations";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createChangeEmailSchema,
    type ChangeEmailValues,
} from "@/lib/validation/account.schemas";
import { toast } from "@/store/toast.store";
import type { ApiUser } from "@/types/user.types";

/**
 * Changing the address on an account, in the three steps the backend imposes.
 *
 *   1. `POST /users/email/setup/:id` mails a six-digit code to the address the
 *      account has **now** — proving control of the old inbox, not the new one.
 *   2. `PATCH /users/email/verify` takes that code plus the account password
 *      and the new address.
 *   3. The controller then sets `isVerified = false` and mails a verification
 *      link to the new address. `protect` refuses an unverified account, so the
 *      session is dead from that moment: every request afterwards would answer
 *      401. Rather than let the user discover that by walking into it, the last
 *      step says so and signs them out deliberately.
 *
 * The server also allows five wrong codes before clearing the stored one, which
 * is why "resend" stays available on the form — it resets the counter as well
 * as the code.
 */
type Step = "request" | "form" | "done";

export function ChangeEmailDialog({
    user,
    open,
    onClose,
}: {
    user: ApiUser;
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const errorMessage = useErrorMessage();
    const [step, setStep] = useState<Step>("request");
    const [requestError, setRequestError] = useState<string | null>(null);

    const requestCode = useRequestEmailChangeCode();
    const verifyChange = useVerifyEmailChange();
    const logout = useLogout();

    const schema = useMemo(
        () => createChangeEmailSchema(t, user.email),
        [t, user.email],
    );
    const form = useForm<ChangeEmailValues>({
        resolver: zodResolver(schema),
        defaultValues: { newEmail: "", code: "", password: "" },
    });

    const close = () => {
        setStep("request");
        setRequestError(null);
        requestCode.reset();
        verifyChange.reset();
        form.reset();
        onClose();
    };

    const sendCode = async (resend = false) => {
        setRequestError(null);
        try {
            await requestCode.mutateAsync(user._id);
            if (resend) toast.success(t("toast.codeResent"), user.email);
            setStep("form");
        } catch (error) {
            setRequestError(errorMessage(error));
        }
    };

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            await verifyChange.mutateAsync({
                // The address the code was mailed to — the controller looks the
                // account up by it, so it is the *current* one, not the new one.
                email: user.email,
                code: values.code,
                password: values.password,
                newEmail: values.newEmail,
            });
            setStep("done");
        } catch (error) {
            const message = applyServerErrors(t, error, form.setError, [
                "code",
                "password",
                "newEmail",
            ]);
            if (message) form.setError("root", { type: "server", message });
        }
    });

    if (step === "request") {
        return (
            <Modal
                open={open}
                onClose={close}
                busy={requestCode.isPending}
                size="sm"
                title={t("account.changeEmailTitle")}
                description={t("account.changeEmailStepOne")}
                footer={
                    <>
                        <Button
                            variant="ghost"
                            onClick={close}
                            disabled={requestCode.isPending}
                        >
                            {t("common.cancel")}
                        </Button>
                        <Button
                            loading={requestCode.isPending}
                            onClick={() => void sendCode()}
                        >
                            <Send className="size-4" />
                            {t("account.sendCode")}
                        </Button>
                    </>
                }
            >
                <div className="space-y-3">
                    {requestError ? <Alert tone="error">{requestError}</Alert> : null}
                    <p className="text-sm text-ink-600">
                        {t("account.codeGoesToCurrent")}
                    </p>
                    <p className="rounded-lg border border-ink-200 bg-ink-100/60 px-3.5 py-2.5 text-sm font-medium text-ink-900">
                        {user.email}
                    </p>
                </div>
            </Modal>
        );
    }

    if (step === "done") {
        return (
            <Modal
                open={open}
                // No dismissal: the session is already unusable, so leaving the
                // dialog without signing out would only produce 401s.
                onClose={() => undefined}
                busy
                size="sm"
                title={t("account.changeEmailDoneTitle")}
                footer={
                    <Button loading={logout.isPending} onClick={() => logout.mutate()}>
                        {t("account.signOutNow")}
                    </Button>
                }
            >
                <div className="space-y-3">
                    <Alert tone="success" title={t("account.changeEmailDoneHeading")}>
                        {t("account.changeEmailDoneBody", {
                            email: form.getValues("newEmail"),
                        })}
                    </Alert>
                    <Alert tone="warning">{t("account.changeEmailSessionEnds")}</Alert>
                </div>
            </Modal>
        );
    }

    return (
        <FormModal
            open={open}
            onClose={close}
            size="sm"
            title={t("account.changeEmailTitle")}
            description={t("account.changeEmailStepTwo", { email: user.email })}
            submitLabel={t("account.changeEmailAction")}
            pending={verifyChange.isPending}
            error={form.formState.errors.root?.message ?? null}
            onSubmit={onSubmit}
        >
            <Input
                label={t("account.newEmail")}
                type="email"
                autoComplete="email"
                autoFocus
                error={form.formState.errors.newEmail?.message}
                {...form.register("newEmail")}
            />

            <Input
                label={t("account.emailCode")}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="text-center text-lg tracking-[0.5em]"
                error={form.formState.errors.code?.message}
                {...form.register("code")}
            />

            <PasswordInput
                label={t("account.confirmPassword")}
                autoComplete="current-password"
                hint={t("account.confirmPasswordHint")}
                error={form.formState.errors.password?.message}
                {...form.register("password")}
            />

            <div className="flex items-center gap-2 text-sm">
                <MailCheck className="size-4 shrink-0 text-ink-400" aria-hidden />
                <span className="text-ink-500">{t("account.noCode")}</span>
                <button
                    type="button"
                    className="font-medium text-link underline-offset-4 transition-colors hover:text-link-strong hover:underline disabled:opacity-60"
                    disabled={requestCode.isPending || verifyChange.isPending}
                    onClick={() => void sendCode(true)}
                >
                    {t("account.resendCode")}
                </button>
            </div>

            {requestError ? <Alert tone="error">{requestError}</Alert> : null}
        </FormModal>
    );
}
