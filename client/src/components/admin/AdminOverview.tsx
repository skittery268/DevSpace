"use client";

import {
    ArrowRight,
    Boxes,
    CircleAlert,
    CircleCheck,
    CircleX,
    FolderTree,
    Package,
    Sparkles,
    Users,
} from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { RemoteImage } from "@/components/common/RemoteImage";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard, StatCardGrid } from "@/components/ui/StatCard";
import { useAuth } from "@/features/auth/useAuth";
import { useCategories } from "@/features/categories/useCategories";
import { useUsers } from "@/features/moderation/useModeration";
import { useProducts } from "@/features/products/useProducts";
import { useFormat } from "@/i18n/useFormat";
import { MAX_PAGE_SIZE, roleLabelKey } from "@/lib/constants";
import { canManageCategories, canModerate } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/**
 * The admin dashboard.
 *
 * There is no statistics or reporting endpoint on the backend, and this file
 * does not invent one. Two numbers are exact — `total` as returned by the list
 * endpoints — and everything else is computed in the browser from the largest
 * page those endpoints will serve (`MAX_PAGE_SIZE`, the server's own cap).
 *
 * Where a figure is drawn from that sample rather than the whole catalog, the
 * card says so. A dashboard that quietly implies it is reporting on everything
 * is worse than one that admits its window.
 */
const SAMPLE = MAX_PAGE_SIZE;

/* -------------------------------------------------------------------------- */
/* Magnitude: products per category                                            */
/* -------------------------------------------------------------------------- */

/**
 * A single-series bar list. One measure, so one hue: length already encodes
 * magnitude and a second colour would only add noise. Values are direct-labeled
 * on the right, which removes the need for an axis entirely.
 */
function CategoryBars({
    rows,
    loading,
}: {
    rows: Array<{ id: string | null; name: string; count: number }>;
    loading: boolean;
}) {
    const { t } = useTranslation();

    if (loading) {
        return (
            <ul className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                    <li key={index} className="space-y-2">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-2 w-full rounded-full" />
                    </li>
                ))}
            </ul>
        );
    }

    if (rows.length === 0) {
        return (
            <p className="py-6 text-center text-sm text-ink-500">
                {t("admin.noProductsListed")}
            </p>
        );
    }

    const max = Math.max(...rows.map((row) => row.count), 1);

    return (
        <ul className="space-y-4">
            {rows.map((row, index) => (
                <li key={row.id ?? "uncategorized"}>
                    <div className="flex items-baseline justify-between gap-4">
                        {row.id ? (
                            <Link
                                href={`/categories/${row.id}`}
                                className="truncate text-sm font-medium text-ink-800 transition-colors hover:text-link"
                            >
                                {row.name}
                            </Link>
                        ) : (
                            <span className="truncate text-sm font-medium text-ink-500">
                                {row.name}
                            </span>
                        )}
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
                            {row.count}
                        </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink-100">
                        <div
                            className="animate-grow-x h-full rounded-full bg-brand-600"
                            style={{
                                width: `${Math.max((row.count / max) * 100, 3)}%`,
                                animationDelay: `${index * 60}ms`,
                            }}
                            role="img"
                            aria-label={t("admin.barLabel", {
                                products: t("count.products", { count: row.count }),
                                name: row.name,
                            })}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

/* -------------------------------------------------------------------------- */
/* State: stock health                                                         */
/* -------------------------------------------------------------------------- */

/**
 * Stock is a *state*, not a series, so it wears the reserved status colours and
 * every segment carries an icon and a label — never colour on its own.
 */
function StockHealth({
    inStock,
    lowStock,
    outOfStock,
    loading,
}: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    loading: boolean;
}) {
    const { t } = useTranslation();
    const total = inStock + lowStock + outOfStock;

    const segments = [
        {
            key: "healthy",
            label: t("admin.stockHealthy"),
            hint: t("admin.stockHealthyHint"),
            value: inStock,
            icon: CircleCheck,
            bar: "bg-success",
            text: "text-success-strong",
        },
        {
            key: "low",
            label: t("admin.stockLow"),
            hint: t("admin.stockLowHint"),
            value: lowStock,
            icon: CircleAlert,
            bar: "bg-warning",
            text: "text-warning-strong",
        },
        {
            key: "out",
            label: t("admin.stockOut"),
            hint: t("admin.stockOutHint"),
            value: outOfStock,
            icon: CircleX,
            bar: "bg-danger",
            text: "text-danger-strong",
        },
    ];

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-2.5 w-full rounded-full" />
                <div className="grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton key={index} className="h-14 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* A 2px surface gap between fills, so neighbouring states never merge
                    into one continuous band. */}
            <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-ink-100">
                {segments.map((segment) =>
                    segment.value > 0 ? (
                        <div
                            key={segment.key}
                            className={cn("h-full first:rounded-l-full last:rounded-r-full", segment.bar)}
                            style={{ width: `${(segment.value / Math.max(total, 1)) * 100}%` }}
                        />
                    ) : null,
                )}
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                {segments.map(({ key, label, hint, value, icon: Icon, text }) => (
                    <div key={key} className="rounded-lg border border-ink-200 bg-surface-3 px-3.5 py-3">
                        <dt className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                            <Icon className={cn("size-3.5 shrink-0", text)} aria-hidden />
                            {label}
                        </dt>
                        <dd className="mt-1.5 text-xl font-semibold tabular-nums tracking-tight text-ink-900">
                            {value}
                        </dd>
                        <p className="mt-0.5 text-[0.6875rem] text-ink-400">{hint}</p>
                    </div>
                ))}
            </dl>
        </div>
    );
}

/* -------------------------------------------------------------------------- */

export function AdminOverview() {
    const { t } = useTranslation();
    const format = useFormat();
    const { user } = useAuth();
    const isAdmin = canModerate(user);

    // One generous page of each list. The server caps `limit` at 100, so this is
    // the widest window the API will give without a reporting endpoint.
    const products = useProducts(1, SAMPLE);
    const categories = useCategories(1, SAMPLE);
    const users = useUsers(1, SAMPLE);

    const items = products.data?.items ?? [];
    const sampleSize = items.length;
    const isSample = (products.data?.total ?? 0) > sampleSize;

    const inventoryValue = items.reduce(
        (sum, product) => sum + product.price * product.stock,
        0,
    );
    const outOfStock = items.filter((product) => product.stock <= 0).length;
    const lowStock = items.filter(
        (product) => product.stock > 0 && product.stock <= 5,
    ).length;
    const inStock = sampleSize - outOfStock - lowStock;

    // Products per category, biggest first, across the loaded sample.
    const byCategory = (() => {
        const counts = new Map<string, { id: string | null; name: string; count: number }>();
        for (const product of items) {
            const id = product.category?.id ?? null;
            const key = id ?? "__none__";
            const existing = counts.get(key);
            if (existing) existing.count += 1;
            else
                counts.set(key, {
                    id,
                    name: product.category?.name ?? t("common.uncategorized"),
                    count: 1,
                });
        }
        return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 6);
    })();

    const recent = items.slice(0, 5);
    const newAccounts = (users.data?.items ?? []).slice(0, 5);

    const firstName = user?.fullname.split(/\s+/)[0] ?? t("admin.welcomeFallback");
    const sampleNote = isSample
        ? t("admin.sampleNote", { count: sampleSize })
        : t("admin.wholeCatalogNote");

    return (
        <>
            {/* Greeting rather than a bare page title: the console is a place someone
                    returns to, and the header is where it says what changed. */}
            <div className="mb-8 flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                <div className="flex items-start gap-4">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-link ring-1 ring-inset ring-brand-line/60">
                        <Sparkles className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-ink-900 sm:text-3xl">
                            {t("admin.welcome", { name: firstName })}
                        </h1>
                        <p className="mt-1.5 text-sm text-ink-500">
                            {t("admin.signedInAs", {
                                role: user ? t(roleLabelKey(user.role)) : t("roles.staff"),
                            })}
                        </p>
                    </div>
                </div>

                <ButtonLink href="/products" variant="outline" size="sm">
                    {t("admin.viewCatalog")}
                    <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
            </div>

            <StatCardGrid className={cn(!isAdmin && "xl:grid-cols-3")}>
                <StatCard
                    icon={Package}
                    tone="brand"
                    label={t("admin.statProducts")}
                    value={format.number(products.data?.total ?? 0)}
                    hint={t("admin.statProductsHint")}
                    href="/products"
                    loading={products.isPending}
                />
                <StatCard
                    icon={FolderTree}
                    tone="teal"
                    label={t("admin.statCategories")}
                    value={format.number(categories.data?.total ?? 0)}
                    hint={
                        canManageCategories(user)
                            ? t("admin.statCategoriesHintManage")
                            : t("admin.statCategoriesHintRead")
                    }
                    href={canManageCategories(user) ? "/admin/categories" : "/categories"}
                    loading={categories.isPending}
                />
                {isAdmin ? (
                    <StatCard
                        icon={Users}
                        tone="neutral"
                        label={t("admin.statAccounts")}
                        value={format.number(users.data?.total ?? 0)}
                        hint={t("admin.statAccountsHint")}
                        href="/admin/users"
                        loading={users.isPending}
                    />
                ) : null}
                <StatCard
                    icon={Boxes}
                    tone="amber"
                    label={t("admin.statInventory")}
                    value={format.price(inventoryValue)}
                    hint={t("admin.statInventoryHint", { note: sampleNote })}
                    loading={products.isPending}
                />
            </StatCardGrid>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
                <div className="space-y-6">
                    <Card>
                        <CardHeader
                            title={t("admin.byCategoryTitle")}
                            description={t("admin.byCategoryBody", { note: sampleNote })}
                        />
                        <CardBody>
                            <CategoryBars rows={byCategory} loading={products.isPending} />
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader
                            title={t("admin.stockHealthTitle")}
                            description={t("admin.stockHealthBody", { note: sampleNote })}
                        />
                        <CardBody>
                            <StockHealth
                                inStock={Math.max(inStock, 0)}
                                lowStock={lowStock}
                                outOfStock={outOfStock}
                                loading={products.isPending}
                            />
                        </CardBody>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader
                            title={t("admin.recentTitle")}
                            description={t("admin.recentBody")}
                        />
                        <CardBody className="py-2">
                            {products.isPending ? (
                                <ul className="divide-y divide-ink-200">
                                    {Array.from({ length: 4 }).map((_, index) => (
                                        <li key={index} className="flex items-center gap-3 py-3">
                                            <Skeleton className="size-10 shrink-0 rounded-lg" />
                                            <div className="flex-1 space-y-1.5">
                                                <Skeleton className="h-3.5 w-full" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : recent.length === 0 ? (
                                <p className="py-6 text-center text-sm text-ink-500">
                                    {t("admin.recentEmpty")}
                                </p>
                            ) : (
                                <ul className="divide-y divide-ink-200">
                                    {recent.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                href={`/products/${product.id}`}
                                                className="group -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-brand-soft/50"
                                            >
                                                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-ink-200 bg-ink-100">
                                                    <RemoteImage
                                                        src={product.images[0]}
                                                        alt={product.title}
                                                        sizes="40px"
                                                    />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-ink-900 group-hover:text-link">
                                                        {product.title}
                                                    </span>
                                                    <span className="block truncate text-xs text-ink-500">
                                                        {format.relativeDate(product.createdAt)}
                                                        {product.seller ? ` · ${product.seller.fullname}` : ""}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-900">
                                                    {format.price(product.price)}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardBody>
                    </Card>

                    {isAdmin ? (
                        <Card>
                            <CardHeader
                                title={t("admin.newAccountsTitle")}
                                description={t("admin.newAccountsBody")}
                                action={
                                    <Link
                                        href="/admin/users"
                                        className="text-xs font-medium text-link transition-colors hover:text-link-strong"
                                    >
                                        {t("common.manage")}
                                    </Link>
                                }
                            />
                            <CardBody className="py-2">
                                {users.isPending ? (
                                    <ul className="divide-y divide-ink-200">
                                        {Array.from({ length: 3 }).map((_, index) => (
                                            <li key={index} className="py-3">
                                                <Skeleton className="h-4 w-full" />
                                            </li>
                                        ))}
                                    </ul>
                                ) : newAccounts.length === 0 ? (
                                    <p className="py-6 text-center text-sm text-ink-500">
                                        {t("admin.newAccountsEmpty")}
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-ink-200">
                                        {newAccounts.map((account) => (
                                            <li
                                                key={account._id}
                                                className="flex items-center gap-3 py-3"
                                            >
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-ink-900">
                                                        {account.fullname}
                                                    </span>
                                                    <span className="block truncate text-xs text-ink-500">
                                                        {account.email}
                                                    </span>
                                                </span>
                                                <Badge tone={account.role === "user" ? "neutral" : "brand"}>
                                                    {t(roleLabelKey(account.role))}
                                                </Badge>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardBody>
                        </Card>
                    ) : null}
                </div>
            </div>

            <Alert tone="info" className="mt-6" title={t("admin.reachTitle")}>
                {t("admin.reachBody")}
            </Alert>
        </>
    );
}
