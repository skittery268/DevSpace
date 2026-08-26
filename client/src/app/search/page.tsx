import type { Metadata } from "next";
import { Suspense } from "react";

import { Container, PageHeader } from "@/components/common/Container";
import { RequireAuth } from "@/components/common/RouteGuard";
import { SearchView } from "@/components/search/SearchView";
import { Skeleton } from "@/components/ui/Skeleton";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("search.title") };
}

/** All three search endpoints sit behind `protect`, so this page needs a session. */
export default async function SearchPage() {
    const { t } = await getServerTranslation();

    return (
        <RequireAuth>
            <Container className="py-10">
                <PageHeader
                    title={t("search.title")}
                    description={t("search.subtitle")}
                />
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                    <SearchView />
                </Suspense>
            </Container>
        </RequireAuth>
    );
}
