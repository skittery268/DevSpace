"use client";

import { Search, SearchX } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { CategoryGrid, CategoryGridSkeleton } from "@/components/category/CategoryCard";
import { EmptyState, ErrorState } from "@/components/common/States";
import { ProductFilterBar } from "@/components/product/ProductFilterBar";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/ProductCard";
import { Alert } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { useCategorySearch, useProductSearch } from "@/features/search/useSearch";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
    applyProductFilters,
    DEFAULT_PRODUCT_FILTERS,
    type ProductFilters,
} from "@/lib/product-filters";
import { cn, pageCount } from "@/lib/utils";

type Tab = "products" | "categories";

const TABS = [
    { id: "products", labelKey: "search.products" },
    { id: "categories", labelKey: "search.categories" },
] as const;

/**
 * `GET /search/products` answers with every match at once — a broad term
 * returns the whole catalog — so the results are paged here before they are
 * rendered. Nothing is hidden: the client already holds the full set, and the
 * count above the grid reports it.
 */
const RESULTS_PER_PAGE = 24;

export function SearchView() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [term, setTerm] = useState(searchParams.get("q") ?? "");
    const [tab, setTab] = useState<Tab>(
        searchParams.get("tab") === "categories" ? "categories" : "products",
    );
    const [filters, setFilters] = useState<ProductFilters>(DEFAULT_PRODUCT_FILTERS);
    const [page, setPage] = useState(1);
    const debouncedTerm = useDebouncedValue(term);

    const productSearch = useProductSearch(debouncedTerm, tab === "products");
    // Category search must never run with an empty term: the controller has no
    // fallback for a missing `name` and answers 500.
    const categorySearch = useCategorySearch(debouncedTerm, tab === "categories");

    const results = productSearch.data;

    /**
     * `GET /search/products` is unpaginated — it returns every match in one
     * response — so narrowing and sorting it here hides nothing. The same code
     * must never be pointed at the paginated catalog endpoint.
     */
    const visible = useMemo(
        () => (results ? applyProductFilters(results, filters) : []),
        [results, filters],
    );

    const resultPageCount = pageCount(visible.length, RESULTS_PER_PAGE);
    // Typing debounces, so a keystroke can shrink the result set a moment after
    // the page was chosen. Clamping on render means the grid is never empty over
    // a non-empty result set, without a round trip through an effect.
    const safePage = Math.min(page, resultPageCount);
    const pageItems = visible.slice(
        (safePage - 1) * RESULTS_PER_PAGE,
        safePage * RESULTS_PER_PAGE,
    );

    const selectTab = (next: Tab) => {
        setTab(next);
        setPage(1);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", next);
        if (term) params.set("q", term);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const trimmed = debouncedTerm.trim();

    return (
        <>
            <Input
                leading={<Search className="size-4" />}
                placeholder={
                    tab === "products"
                        ? t("search.productsPlaceholder")
                        : t("search.categoriesPlaceholder")
                }
                value={term}
                onChange={(event) => {
                    setTerm(event.target.value);
                    setPage(1);
                }}
                wrapperClassName="mb-6 max-w-2xl"
                aria-label={t("search.term")}
                type="search"
            />

            <div
                role="tablist"
                aria-label={t("search.scope")}
                className="mb-6 flex gap-1 border-b border-ink-200"
            >
                {TABS.map(({ id, labelKey }) => (
                    <button
                        key={id}
                        role="tab"
                        type="button"
                        aria-selected={tab === id}
                        onClick={() => selectTab(id)}
                        className={cn(
                            "-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors duration-200",
                            tab === id
                                ? "border-brand-500 text-ink-900"
                                : "border-transparent text-ink-500 hover:border-ink-300 hover:text-ink-800",
                        )}
                    >
                        {t(labelKey)}
                    </button>
                ))}
            </div>

            {tab === "products" ? (
                productSearch.isPending ? (
                    <ProductGridSkeleton count={8} />
                ) : productSearch.isError ? (
                    <ErrorState
                        error={productSearch.error}
                        onRetry={() => void productSearch.refetch()}
                    />
                ) : productSearch.data.length === 0 ? (
                    <EmptyState
                        icon={<SearchX className="size-6" />}
                        title={t("search.noProductsTitle")}
                        description={
                            trimmed
                                ? t("search.noProductsBody", { term: trimmed })
                                : t("search.catalogEmpty")
                        }
                    />
                ) : (
                    <>
                        <ProductFilterBar
                            products={productSearch.data}
                            filters={filters}
                            onChange={(next) => {
                                setFilters(next);
                                setPage(1);
                            }}
                            className="mb-5"
                        />

                        <p className="mb-4 text-sm text-ink-500">
                            <Trans
                                i18nKey="search.showingOf"
                                values={{
                                    shown: pageItems.length,
                                    products: t("count.products", { count: visible.length }),
                                }}
                                components={[
                                    <span key="0" className="font-semibold text-ink-900" />,
                                ]}
                            />
                            {visible.length === productSearch.data.length
                                ? ""
                                : t("search.filteredFrom", {
                                        count: productSearch.data.length,
                                    })}
                            {trimmed ? t("search.matchingTerm", { term: trimmed }) : ""}
                            {resultPageCount > 1
                                ? ` · ${t("common.pageOf", { page: safePage, pageCount: resultPageCount })}`
                                : ""}
                        </p>

                        {visible.length === 0 ? (
                            <EmptyState
                                icon={<SearchX className="size-6" />}
                                title={t("search.noFilterMatchTitle")}
                                description={t("search.noFilterMatchBody")}
                            />
                        ) : (
                            <>
                                <ProductGrid products={pageItems} priorityCount={4} />
                                <Pagination
                                    className="mt-10"
                                    page={safePage}
                                    pageCount={resultPageCount}
                                    onPageChange={(next) => {
                                        setPage(next);
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                    }}
                                />
                            </>
                        )}
                    </>
                )
            ) : trimmed.length === 0 ? (
                <EmptyState
                    icon={<Search className="size-6" />}
                    title={t("search.typeToSearchTitle")}
                    description={t("search.typeToSearchBody")}
                />
            ) : categorySearch.isPending ? (
                <CategoryGridSkeleton count={6} />
            ) : categorySearch.isError ? (
                <ErrorState
                    error={categorySearch.error}
                    onRetry={() => void categorySearch.refetch()}
                />
            ) : categorySearch.data.length === 0 ? (
                <EmptyState
                    icon={<SearchX className="size-6" />}
                    title={t("search.noCategoriesTitle")}
                    description={t("search.noCategoriesBody", { term: trimmed })}
                />
            ) : (
                <>
                    <p className="mb-4 text-sm text-ink-500">
                        <span className="font-semibold text-ink-900">
                            {t("search.categoriesMatching", {
                                categories: t("count.categories", {
                                    count: categorySearch.data.length,
                                }),
                                term: trimmed,
                            })}
                        </span>
                    </p>
                    <CategoryGrid categories={categorySearch.data} />
                </>
            )}

            <Alert tone="info" className="mt-10">
                {t("search.note")}
            </Alert>
        </>
    );
}
