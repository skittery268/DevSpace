"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { AuroraBackdrop, Container } from "@/components/common/Container";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div className="relative isolate overflow-hidden">
            <AuroraBackdrop />
            <Container className="flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex size-16 items-center justify-center rounded-xl border border-danger-line bg-danger-soft text-danger">
                    <TriangleAlert className="size-7" aria-hidden />
                </div>
                <h1 className="text-title text-ink-900">
                    {t("states.crashTitle")}
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-500">
                    {error.message || t("states.crashBody")}
                </p>
                {error.digest ? (
                    <p className="mt-2 font-mono text-xs text-ink-400">
                        {t("states.reference", { digest: error.digest })}
                    </p>
                ) : null}
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                    <Button onClick={reset}>
                        <RefreshCw className="size-4" aria-hidden />
                        {t("states.tryAgain")}
                    </Button>
                    <ButtonLink href="/" variant="outline">
                        {t("states.backToHome")}
                    </ButtonLink>
                </div>
            </Container>
        </div>
    );
}
