import type { Metadata } from "next";

import { AuroraBackdrop, Container } from "@/components/common/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

/**
 * A 404 already carries the status code that keeps it out of an index, but the
 * page is also reachable through client navigation, where no status is sent.
 * `follow` stays on because the two links on it go to the catalog.
 */
export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("states.notFoundTitle"), robots: NOINDEX };
}

export default async function NotFound() {
    const { t } = await getServerTranslation();

    return (
        <div className="relative isolate overflow-hidden">
            <AuroraBackdrop />
            <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
                <p className="text-brand-gradient text-7xl font-semibold tracking-tight sm:text-8xl">
                    {t("states.notFoundCode")}
                </p>
                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
                    {t("states.notFoundTitle")}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
                    {t("states.notFoundBody")}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <ButtonLink href="/">{t("states.backToHome")}</ButtonLink>
                    <ButtonLink href="/products" variant="outline">
                        {t("states.browseProducts")}
                    </ButtonLink>
                </div>
            </Container>
        </div>
    );
}
