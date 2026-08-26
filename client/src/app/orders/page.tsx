import type { Metadata } from "next";
import { Suspense } from "react";

import { Container, PageHeader } from "@/components/common/Container";
import { RequireAuth } from "@/components/common/RouteGuard";
import { OrderList } from "@/components/order/OrderList";
import { Skeleton } from "@/components/ui/Skeleton";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("orders.title") };
}

export default async function OrdersPage() {
    const { t } = await getServerTranslation();

    return (
        <RequireAuth>
            <Container className="py-10">
                <PageHeader
                    title={t("orders.title")}
                    description={t("orders.subtitle")}
                />
                <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    <OrderList />
                </Suspense>
            </Container>
        </RequireAuth>
    );
}
