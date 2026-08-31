import type { Metadata } from "next";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Spinner } from "@/components/ui/Spinner";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("auth.resetTitle"),
    };
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-16">
                    <Spinner className="size-6 text-brand-500" />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
