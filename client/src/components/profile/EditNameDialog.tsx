"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/Field";
import { FormModal } from "@/components/ui/FormModal";
import { useUpdateFullname } from "@/features/account/useAccount";
import { applyServerErrors } from "@/lib/form-errors";
import {
    createFullnameSchema,
    type FullnameValues,
} from "@/lib/validation/account.schemas";
import { toast } from "@/store/toast.store";
import type { ApiUser } from "@/types/user.types";

/** `PATCH /users/fullname/:id` — 5–50 characters, the account owner only. */
export function EditNameDialog({
    user,
    open,
    onClose,
}: {
    user: ApiUser;
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const updateFullname = useUpdateFullname();

    const schema = useMemo(() => createFullnameSchema(t), [t]);
    const form = useForm<FullnameValues>({
        resolver: zodResolver(schema),
        defaultValues: { fullname: user.fullname },
    });

    const close = () => {
        updateFullname.reset();
        form.reset({ fullname: user.fullname });
        onClose();
    };

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            await updateFullname.mutateAsync({
                userId: user._id,
                fullname: values.fullname,
            });
            toast.success(t("toast.nameUpdated"), values.fullname);
            close();
        } catch (error) {
            const message = applyServerErrors(t, error, form.setError, ["fullname"]);
            if (message) form.setError("root", { type: "server", message });
        }
    });

    return (
        <FormModal
            open={open}
            onClose={close}
            size="sm"
            title={t("account.editNameTitle")}
            description={t("account.editNameBody")}
            submitLabel={t("common.save")}
            pending={updateFullname.isPending}
            error={form.formState.errors.root?.message ?? null}
            onSubmit={onSubmit}
        >
            <Input
                label={t("auth.fullName")}
                autoComplete="name"
                autoFocus
                error={form.formState.errors.fullname?.message}
                {...form.register("fullname")}
            />
        </FormModal>
    );
}
