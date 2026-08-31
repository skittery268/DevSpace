"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Select } from "@/components/ui/Field";
import {
    activeFilterCount,
    categoriesOf,
    DEFAULT_PRODUCT_FILTERS,
    PRODUCT_SORTS,
    sortLabelKey,
    type ProductFilters,
    type ProductSort,
} from "@/lib/product-filters";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product.types";

/**
 * Sort and filter controls for a result set the client holds in full.
 *
 * The category options are derived from the results themselves rather than
 * fetched, so the picker can never offer a category that would return nothing —
 * and the bar costs no extra request.
 *
 * On a narrow screen the filters collapse behind a toggle so the results stay
 * the first thing on the page; the sort control stays visible because it is the
 * one people reach for most.
 */
export function ProductFilterBar({
    products,
    filters,
    onChange,
    className,
}: {
    products: Product[];
    filters: ProductFilters;
    onChange: (filters: ProductFilters) => void;
    className?: string;
}) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const categories = categoriesOf(products);
    const activeCount = activeFilterCount(filters);

    const set = <TKey extends keyof ProductFilters>(
        key: TKey,
        value: ProductFilters[TKey],
    ) => onChange({ ...filters, [key]: value });

    return (
        <div
            className={cn(
                "rounded-xl border border-ink-200 bg-surface p-4 elev-1",
                className,
            )}
        >
            <div className="flex flex-wrap items-center gap-3">
                <p className="hidden items-center gap-2 text-sm font-medium text-ink-700 sm:flex">
                    <SlidersHorizontal className="size-4 text-ink-400" aria-hidden />
                    {t("filters.refine")}
                    {activeCount > 0 ? (
                        <Badge tone="brand">
                            {t("filters.activeCount", { count: activeCount })}
                        </Badge>
                    ) : null}
                </p>

                <Button
                    variant={expanded ? "subtle" : "outline"}
                    size="sm"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    aria-controls="product-filters"
                    className="sm:hidden"
                >
                    <SlidersHorizontal className="size-4" aria-hidden />
                    {t("filters.filters")}
                    {activeCount > 0 ? <Badge tone="brand">{activeCount}</Badge> : null}
                </Button>

                <label className="ml-auto flex items-center gap-2 text-sm text-ink-500">
                    <span className="hidden sm:inline">{t("filters.sortBy")}</span>
                    <Select
                        value={filters.sort}
                        onChange={(event) => set("sort", event.target.value as ProductSort)}
                        aria-label={t("filters.sortProducts")}
                        className="h-11 w-auto min-w-44 py-0 text-sm sm:h-9"
                        wrapperClassName="gap-0"
                    >
                        {PRODUCT_SORTS.map((sort) => (
                            <option key={sort} value={sort}>
                                {t(sortLabelKey(sort))}
                            </option>
                        ))}
                    </Select>
                </label>
            </div>

            <div
                id="product-filters"
                className={cn(
                    "mt-4 grid gap-3 border-t border-ink-200 pt-4 sm:grid-cols-2 lg:grid-cols-4",
                    // Opening fades the panel in; collapsing is instant, and stays
                    // that way on purpose. This block sits in the flow, so an exit
                    // animation would have to hold its height while everything
                    // below waits — animating a layout property every frame is the
                    // one thing a filter panel over a long grid must not do.
                    expanded ? "animate-rise grid" : "hidden sm:grid",
                )}
            >
                <Select
                    label={t("filters.category")}
                    value={filters.categoryId}
                    onChange={(event) => set("categoryId", event.target.value)}
                    className="h-11 sm:h-10"
                >
                    <option value="all">{t("filters.allCategories")}</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {t("filters.categoryWithCount", {
                                name: category.name,
                                count: category.count,
                            })}
                        </option>
                    ))}
                </Select>

                <Input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    label={t("filters.minPrice")}
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(event) => set("minPrice", event.target.value)}
                    className="h-11 sm:h-10"
                />

                <Input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    label={t("filters.maxPrice")}
                    placeholder={t("filters.anyPrice")}
                    value={filters.maxPrice}
                    onChange={(event) => set("maxPrice", event.target.value)}
                    className="h-11 sm:h-10"
                />

                <div className="flex items-end justify-between gap-2 pb-1">
                    <Checkbox
                        label={t("filters.inStockOnly")}
                        checked={filters.inStockOnly}
                        onChange={(event) => set("inStockOnly", event.target.checked)}
                    />

                    {activeCount > 0 ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange({ ...DEFAULT_PRODUCT_FILTERS, sort: filters.sort })}
                        >
                            <X className="size-4" aria-hidden />
                            {t("filters.clear")}
                        </Button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
