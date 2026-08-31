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
            <Container className="flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
                <p className="text-brand-gradient text-[clamp(3.5rem,2.6rem+4.5vw,6rem)] font-semibold leading-none tracking-tight">
                    {t("states.notFoundCode")}
                </p>
                <h1 className="text-title mt-4 text-ink-900">
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
