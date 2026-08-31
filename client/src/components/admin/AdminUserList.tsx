"use client";

import {
    Ban,
    ChevronDown,
    Search,
    ShieldCheck,
    Trash2,
    TriangleAlert,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { RevokeSanctionDialog, SanctionDialog } from "./ModerationDialogs";
import { UserWarnings } from "./UserWarnings";
import { PageHeader } from "@/components/common/Container";
import { EmptyState, ErrorState } from "@/components/common/States";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
    Table,
    TableFrame,
    TableSkeletonRows,
    TBody,
    TD,
    TH,
    THead,
    TR,
} from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/features/auth/useAuth";
import { useDeleteUser, useUsers } from "@/features/moderation/useModeration";
import { useUserSearch } from "@/features/search/useSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useErrorMessage } from "@/hooks/useErrorMessage";
import { usePageParam } from "@/hooks/usePageParam";
import { useFormat } from "@/i18n/useFormat";
import { DEFAULT_PAGE_SIZE, roleLabelKey } from "@/lib/constants";
import { getActiveBanId } from "@/lib/mappers";
import { canDeleteUser, canModerateTarget, isSelf } from "@/lib/permissions";
import { cn, initialsOf } from "@/lib/utils";
import { toast } from "@/store/toast.store";
import type { ApiUser } from "@/types/user.types";

type SanctionState =
    | { mode: "warn" | "ban"; user: ApiUser }
    | { mode: "unban" | "unwarn"; user: ApiUser; actionId: string }
    | null;

/** The number of columns a full-width expansion row has to span. */
const COLUMN_COUNT = 5;

/**
 * What a row is allowed to do, resolved once and shared by both layouts.
 *
 * The table and the mobile card render the same account with the same rules;
 * only the arrangement differs, so the rules do not get to differ with it.
 */
function rowState(user: ApiUser, actor: ApiUser | null) {
    const activeBanId = getActiveBanId(user);
    return {
        activeBanId,
        // Warn/ban refuse to target yourself or another admin.
        mayModerate: canModerateTarget(actor, user),
        // Deletion has looser rules — an admin may delete anyone — but
        // self-deletion belongs on the profile page, not in a list row.
        mayDelete: canDeleteUser(actor, user._id) && !isSelf(actor, user._id),
    };
}

function StatusBadges({
    user,
    banned,
}: {
    user: ApiUser;
    banned: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-wrap gap-1.5">
            {banned ? (
                <Badge tone="danger">{t("moderation.banned")}</Badge>
            ) : (
                <Badge tone="success">{t("moderation.active")}</Badge>
            )}
            {!user.isVerified ? (
                <Badge tone="warning">{t("moderation.unverified")}</Badge>
            ) : null}
            {user.twoFactorEnabled ? (
                <Badge tone="success">
                    <ShieldCheck className="size-3" />
                    2FA
                </Badge>
            ) : null}
            <Badge tone="neutral">
                {user.provider === "google"
                    ? t("moderation.google")
                    : t("moderation.emailProvider")}
            </Badge>
        </div>
    );
}

function RowActions({
    user,
    actor,
    expanded,
    onToggle,
    onSanction,
    onDelete,
    /** Labels are dropped on the table, where the column is narrow. */
    showLabels = false,
}: {
    user: ApiUser;
    actor: ApiUser | null;
    expanded: boolean;
    onToggle: () => void;
    onSanction: (state: SanctionState) => void;
    onDelete: (user: ApiUser) => void;
    showLabels?: boolean;
}) {
    const { t } = useTranslation();
    const { activeBanId, mayModerate, mayDelete } = rowState(user, actor);

    return (
        <div className="flex items-center justify-end gap-1">
            {mayModerate ? (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSanction({ mode: "warn", user })}
                    >
                        <TriangleAlert className="size-4" />
                        <span className={showLabels ? "" : "hidden xl:inline"}>
                            {t("moderation.warn")}
                        </span>
                    </Button>

                    {activeBanId ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSanction({ mode: "unban", user, actionId: activeBanId })}
                        >
                            {t("moderation.unban")}
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-danger hover:bg-danger-soft hover:text-danger"
                            onClick={() => onSanction({ mode: "ban", user })}
                        >
                            <Ban className="size-4" />
                            <span className={showLabels ? "" : "hidden xl:inline"}>
                                {t("moderation.ban")}
                            </span>
                        </Button>
                    )}
                </>
            ) : (
                <span className="mr-1 text-xs text-ink-400">
                    {isSelf(actor, user._id)
                        ? t("moderation.thatsYou")
                        : t("moderation.protected")}
                </span>
            )}

            {mayDelete ? (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-danger hover:bg-danger-soft hover:text-danger"
                    aria-label={t("moderation.deleteUserAria", { name: user.fullname })}
                    onClick={() => onDelete(user)}
                >
                    <Trash2 className="size-4" />
                </Button>
            ) : null}

            <Button
                variant="ghost"
                size="sm"
                aria-expanded={expanded}
                aria-label={t("moderation.toggleWarningsAria", {
                    name: user.fullname,
                })}
                onClick={onToggle}
            >
                <ChevronDown
                    className={cn("size-4 transition-transform", expanded && "rotate-180")}
                />
            </Button>
        </div>
    );
}

function Warnings({
    user,
    mayModerate,
    onSanction,
}: {
    user: ApiUser;
    mayModerate: boolean;
    onSanction: (state: SanctionState) => void;
}) {
    const { t } = useTranslation();

    return (
        <>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-ink-500">
                {t("moderation.activeWarnings")}
            </p>
            <UserWarnings
                userId={user._id}
                canRevoke={mayModerate}
                onRevoke={(warnId) => onSanction({ mode: "unwarn", user, actionId: warnId })}
            />
        </>
    );
}

function Identity({ user }: { user: ApiUser }) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[0.6875rem] font-bold text-ink-600">
                {initialsOf(user.fullname) || "?"}
            </span>
            <div className="min-w-0">
                <p className="truncate font-medium text-ink-900">{user.fullname}</p>
                <p className="truncate text-xs text-ink-500">{user.email}</p>
            </div>
        </div>
    );
}

/** The table row, used from `lg` up. */
function UserRow({
    user,
    actor,
    onSanction,
    onDelete,
}: {
    user: ApiUser;
    actor: ApiUser | null;
    onSanction: (state: SanctionState) => void;
    onDelete: (user: ApiUser) => void;
}) {
    const { t } = useTranslation();
    const format = useFormat();
    const [expanded, setExpanded] = useState(false);
    const { activeBanId, mayModerate } = rowState(user, actor);

    return (
        <>
            <TR className={cn(expanded && "bg-brand-soft/40")}>
                <TD>
                    <Identity user={user} />
                </TD>

                <TD>
                    <Badge tone={user.role === "user" ? "neutral" : "brand"}>
                        {t(roleLabelKey(user.role))}
                    </Badge>
                </TD>

                <TD>
                    <StatusBadges user={user} banned={Boolean(activeBanId)} />
                </TD>

                <TD className="whitespace-nowrap text-ink-500">
                    {format.date(user.createdAt)}
                </TD>

                <TD align="right">
                    <RowActions
                        user={user}
                        actor={actor}
                        expanded={expanded}
                        onToggle={() => setExpanded((value) => !value)}
                        onSanction={onSanction}
                        onDelete={onDelete}
                    />
                </TD>
            </TR>

            {expanded ? (
                <tr className="bg-surface-3">
                    <TD colSpan={COLUMN_COUNT} className="px-4 py-4">
                        <Warnings user={user} mayModerate={mayModerate} onSanction={onSanction} />
                    </TD>
                </tr>
            ) : null}
        </>
    );
}

/**
 * The same account as a stacked card, below `lg`.
 *
 * A five-column table on a 390px screen can only scroll sideways, which hides
 * exactly the column the moderator came for. The card keeps every action on
 * screen and in reach instead.
 */
function UserCard({
    user,
    actor,
    onSanction,
    onDelete,
}: {
    user: ApiUser;
    actor: ApiUser | null;
    onSanction: (state: SanctionState) => void;
    onDelete: (user: ApiUser) => void;
}) {
    const { t } = useTranslation();
    const format = useFormat();
    const [expanded, setExpanded] = useState(false);
    const { activeBanId, mayModerate } = rowState(user, actor);

    return (
        <li className="px-4 py-4">
            <Identity user={user} />

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Badge tone={user.role === "user" ? "neutral" : "brand"}>
                    {t(roleLabelKey(user.role))}
                </Badge>
                <StatusBadges user={user} banned={Boolean(activeBanId)} />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-ink-400">
                    {t("moderation.joined", { date: format.date(user.createdAt) })}
                </span>
                <RowActions
                    user={user}
                    actor={actor}
                    expanded={expanded}
                    onToggle={() => setExpanded((value) => !value)}
                    onSanction={onSanction}
                    onDelete={onDelete}
                    showLabels
                />
            </div>

            {expanded ? (
                <div className="mt-3 rounded-lg border border-ink-200 bg-surface-3 px-3.5 py-3">
                    <Warnings user={user} mayModerate={mayModerate} onSanction={onSanction} />
                </div>
            ) : null}
        </li>
    );
}

export function AdminUserList() {
    const { t } = useTranslation();
    const errorMessage = useErrorMessage();
    const { page, setPage } = usePageParam();
    const { user: actor } = useAuth();
    const [term, setTerm] = useState("");
    const debouncedTerm = useDebouncedValue(term);
    const isSearching = debouncedTerm.trim().length > 0;

    const listQuery = useUsers(page, DEFAULT_PAGE_SIZE);
    // `/search/users` is unpaginated and returns every match at once.
    const searchQuery = useUserSearch(debouncedTerm, isSearching);
    const deleteUser = useDeleteUser();

    const [sanction, setSanction] = useState<SanctionState>(null);
    const [pendingDelete, setPendingDelete] = useState<ApiUser | null>(null);

    const activeQuery = isSearching ? searchQuery : listQuery;
    const users: ApiUser[] = isSearching
        ? (searchQuery.data ?? [])
        : (listQuery.data?.items ?? []);

    const handleDelete = async () => {
        if (!pendingDelete) return;
        try {
            await deleteUser.mutateAsync(pendingDelete._id);
            toast.success(t("toast.accountDeleted"), pendingDelete.fullname);
            setPendingDelete(null);
        } catch {
            // The dialog renders the mutation error.
        }
    };

    const countLabel = isSearching
        ? t("count.matches", { count: users.length })
        : t("count.accounts", { count: listQuery.data?.total ?? 0 });

    return (
        <>
            <PageHeader
                title={t("moderation.title")}
                description={t("moderation.subtitle")}
            />

            {activeQuery.isError ? (
                <ErrorState
                    error={activeQuery.error}
                    onRetry={() => void activeQuery.refetch()}
                />
            ) : (
                <TableFrame
                    toolbar={
                        <>
                            <Input
                                leading={<Search className="size-4" />}
                                placeholder={t("moderation.searchPlaceholder")}
                                value={term}
                                onChange={(event) => setTerm(event.target.value)}
                                wrapperClassName="w-full max-w-xs"
                                className="h-11 sm:h-9"
                                aria-label={t("moderation.searchAria")}
                            />
                            <p className="ml-auto text-sm text-ink-500">
                                {activeQuery.isPending ? t("common.loading") : countLabel}
                            </p>
                        </>
                    }
                    footer={
                        !isSearching && listQuery.data && listQuery.data.pageCount > 1 ? (
                            <Pagination
                                className="w-full"
                                page={listQuery.data.page}
                                pageCount={listQuery.data.pageCount}
                                onPageChange={setPage}
                                disabled={listQuery.isFetching}
                            />
                        ) : undefined
                    }
                >
                    {!activeQuery.isPending && users.length === 0 ? (
                        <div className="p-4">
                            <EmptyState
                                icon={<Users className="size-6" />}
                                title={
                                    isSearching
                                        ? t("moderation.noMatchingUsers")
                                        : t("moderation.noUsers")
                                }
                                description={
                                    isSearching
                                        ? t("moderation.noMatchingUsersBody", {
                                                term: debouncedTerm,
                                            })
                                        : t("moderation.noUsersBody")
                                }
                                className="border-0"
                            />
                        </div>
                    ) : (
                        <>
                            <div className="hidden lg:block">
                                <Table className="min-w-[46rem]">
                                    <THead>
                                        <TH className="w-[30%]">{t("moderation.columnAccount")}</TH>
                                        <TH className="w-32">{t("moderation.columnRole")}</TH>
                                        <TH>{t("common.status")}</TH>
                                        <TH className="w-32">{t("moderation.columnJoined")}</TH>
                                        <TH align="right" className="w-52">
                                            {t("common.actions")}
                                        </TH>
                                    </THead>

                                    {activeQuery.isPending ? (
                                        <TableSkeletonRows columns={COLUMN_COUNT} rows={6} />
                                    ) : (
                                        <TBody>
                                            {users.map((user) => (
                                                <UserRow
                                                    key={user._id}
                                                    user={user}
                                                    actor={actor}
                                                    onSanction={setSanction}
                                                    onDelete={setPendingDelete}
                                                />
                                            ))}
                                        </TBody>
                                    )}
                                </Table>
                            </div>

                            <ul className="divide-y divide-ink-200 lg:hidden">
                                {activeQuery.isPending
                                    ? Array.from({ length: 5 }).map((_, index) => (
                                            <li key={index} className="px-4 py-4">
                                                <Skeleton className="h-14 w-full" />
                                            </li>
                                        ))
                                    : users.map((user) => (
                                            <UserCard
                                                key={user._id}
                                                user={user}
                                                actor={actor}
                                                onSanction={setSanction}
                                                onDelete={setPendingDelete}
                                            />
                                        ))}
                            </ul>
                        </>
                    )}
                </TableFrame>
            )}

            <Alert tone="info" className="mt-6" title={t("moderation.sanctionsNoteTitle")}>
                {t("moderation.sanctionsNoteBody")}
            </Alert>

            <SanctionDialog
                open={sanction?.mode === "warn" || sanction?.mode === "ban"}
                kind={sanction?.mode === "ban" ? "ban" : "warn"}
                user={sanction?.user ?? null}
                onClose={() => setSanction(null)}
            />

            <RevokeSanctionDialog
                open={sanction?.mode === "unban" || sanction?.mode === "unwarn"}
                kind={sanction?.mode === "unwarn" ? "unwarn" : "unban"}
                user={sanction?.user ?? null}
                actionId={
                    sanction && "actionId" in sanction ? sanction.actionId : null
                }
                onClose={() => setSanction(null)}
            />

            <ConfirmDialog
                open={pendingDelete !== null}
                title={t("moderation.deleteAccountTitle")}
                description={
                    pendingDelete
                        ? t("moderation.deleteAccountBody", {
                                name: pendingDelete.fullname,
                            })
                        : undefined
                }
                confirmLabel={t("moderation.deleteAccountAction")}
                loading={deleteUser.isPending}
                error={deleteUser.error ? errorMessage(deleteUser.error) : null}
                onConfirm={() => void handleDelete()}
                onCancel={() => {
                    deleteUser.reset();
                    setPendingDelete(null);
                }}
            />
        </>
    );
}
