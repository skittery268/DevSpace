"use client";

import {
    AtSign,
    Heart,
    KeyRound,
    LayoutDashboard,
    Package,
    Pencil,
    Store,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ChangeEmailDialog } from "./ChangeEmailDialog";
import { EditNameDialog } from "./EditNameDialog";
import { TwoFactorSettings } from "./TwoFactorSettings";
import { Container, PageHeader } from "@/components/common/Container";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/features/auth/useAuth";
import { useLogout } from "@/features/auth/useAuthMutations";
import { useDeleteUser } from "@/features/moderation/useModeration";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { useFormat } from "@/i18n/useFormat";
import { roleLabelKey } from "@/lib/constants";
import { getActiveBanId } from "@/lib/mappers";
import { hasSellerArea, hasStaffArea } from "@/lib/permissions";
import { initialsOf } from "@/lib/utils";
import { toast } from "@/store/toast.store";

export function ProfileView() {
    const { t } = useTranslation();
    const format = useFormat();
    const errorMessage = useErrorMessage();
    const { user } = useAuth();
    const router = useRouter();
    const deleteUser = useDeleteUser();
    const logout = useLogout();
    const [confirmingDelete, setConfirmingDelete] = useState(false);
    const [editing, setEditing] = useState<"name" | "email" | null>(null);

    if (!user) return null;

    // `PATCH /users/email/verify` re-checks the account password, which an
    // account provisioned through Google never has — the same wall 2FA hits.
    const canChangeEmail = user.provider === "local";

    const activeBanId = getActiveBanId(user);

    const handleDelete = async () => {
        try {
            await deleteUser.mutateAsync(user._id);
            toast.success(t("toast.accountDeleted"));
            setConfirmingDelete(false);
            // The soft delete does not clear the session cookie — `protect` starts
            // rejecting it, so the client has to end the session itself.
            logout.mutate();
            router.push("/");
        } catch {
            // The dialog renders the mutation error.
        }
    };

    const shortcuts = [
        { href: "/orders", label: t("account.yourOrders"), icon: Package, show: true },
        {
            href: "/wishlist",
            label: t("account.yourWishlist"),
            icon: Heart,
            show: true,
        },
        {
            href: "/seller",
            label: t("account.sellerArea"),
            icon: Store,
            show: hasSellerArea(user),
        },
        {
            href: "/admin",
            label: t("account.adminArea"),
            icon: LayoutDashboard,
            show: hasStaffArea(user),
        },
    ].filter((item) => item.show);

    return (
        <Container className="py-10">
            <PageHeader
                title={t("account.title")}
                description={t("account.subtitle")}
            />

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
                <div className="space-y-6">
                    <Card>
                        <CardHeader
                            title={t("account.profile")}
                            action={
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing("name")}
                                >
                                    <Pencil className="size-4" />
                                    {t("account.editName")}
                                </Button>
                            }
                        />
                        <CardBody>
                            <div className="flex items-start gap-4">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white">
                                    {initialsOf(user.fullname) || "?"}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-lg font-semibold text-ink-900">
                                        {user.fullname}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                        <p className="truncate text-sm text-ink-500">
                                            {user.email}
                                        </p>
                                        {canChangeEmail ? (
                                            <button
                                                type="button"
                                                onClick={() => setEditing("email")}
                                                className="inline-flex items-center gap-1 text-xs font-medium text-link underline-offset-4 transition-colors hover:text-link-strong hover:underline"
                                            >
                                                <AtSign className="size-3.5" aria-hidden />
                                                {t("account.changeEmail")}
                                            </button>
                                        ) : null}
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        <Badge tone={user.role === "user" ? "neutral" : "brand"}>
                                            {t(roleLabelKey(user.role))}
                                        </Badge>
                                        <Badge tone="neutral">
                                            {user.provider === "google"
                                                ? t("account.googleAccount")
                                                : t("account.emailAccount")}
                                        </Badge>
                                        {user.isVerified ? (
                                            <Badge tone="success">{t("account.verified")}</Badge>
                                        ) : (
                                            <Badge tone="warning">{t("account.unverified")}</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <dl className="mt-5 divide-y divide-ink-200 border-t border-ink-200 text-sm">
                                <div className="flex justify-between gap-4 py-2.5">
                                    <dt className="text-ink-500">{t("account.memberSince")}</dt>
                                    <dd className="font-medium text-ink-900">
                                        {format.date(user.createdAt)}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4 py-2.5">
                                    <dt className="text-ink-500">{t("account.accountStatus")}</dt>
                                    <dd className="font-medium text-ink-900">
                                        {activeBanId
                                            ? t("account.restricted")
                                            : t("account.active")}
                                    </dd>
                                </div>
                            </dl>

                            <Alert tone="info" className="mt-5">
                                {canChangeEmail
                                    ? t("account.profileNote")
                                    : t("account.profileNoteGoogle")}
                            </Alert>
                        </CardBody>
                    </Card>

                    <TwoFactorSettings user={user} />

                    <Card>
                        <CardHeader
                            title={t("account.passwordTitle")}
                            description={t("account.passwordSubtitle")}
                        />
                        <CardBody>
                            {user.provider === "google" ? (
                                <Alert tone="info">{t("account.passwordGoogleNote")}</Alert>
                            ) : (
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-ink-600">
                                        {t("account.passwordResetNote")}
                                    </p>
                                    <ButtonLink href="/forgot-password" variant="outline">
                                        <KeyRound className="size-4" />
                                        {t("account.resetPassword")}
                                    </ButtonLink>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    <Card className="border-danger-line">
                        <CardHeader
                            title={t("account.deleteTitle")}
                            description={t("account.deleteSubtitle")}
                        />
                        <CardBody className="space-y-4">
                            <Alert tone="warning">{t("account.deleteWarning")}</Alert>
                            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
                                {t("account.deleteAction")}
                            </Button>
                        </CardBody>
                    </Card>
                </div>

                <Card className="lg:sticky lg:top-20">
                    <CardHeader title={t("account.shortcuts")} />
                    <CardBody className="space-y-2">
                        {shortcuts.map(({ href, label, icon: Icon }) => (
                            <ButtonLink
                                key={href}
                                href={href}
                                variant="outline"
                                fullWidth
                                className="justify-start"
                            >
                                <Icon className="size-4" />
                                {label}
                            </ButtonLink>
                        ))}
                    </CardBody>
                </Card>
            </div>

            <EditNameDialog
                user={user}
                open={editing === "name"}
                onClose={() => setEditing(null)}
            />

            {canChangeEmail ? (
                <ChangeEmailDialog
                    user={user}
                    open={editing === "email"}
                    onClose={() => setEditing(null)}
                />
            ) : null}

            <ConfirmDialog
                open={confirmingDelete}
                title={t("account.deleteConfirmTitle")}
                description={t("account.deleteConfirmBody")}
                confirmLabel={t("account.deleteConfirmAction")}
                loading={deleteUser.isPending}
                error={deleteUser.error ? errorMessage(deleteUser.error) : null}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    deleteUser.reset();
                    setConfirmingDelete(false);
                }}
            />
        </Container>
    );
}
