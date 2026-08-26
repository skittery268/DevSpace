import type { Metadata } from "next";
import { Suspense } from "react";

import { TwoFactorLoginForm } from "@/components/auth/TwoFactorLoginForm";
import { Spinner } from "@/components/ui/Spinner";
import { getServerTranslation } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return { title: t("twoFactor.title") };
}

export default function TwoFactorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-16">
                    <Spinner className="size-6 text-brand-500" />
                </div>
            }
        >
            <TwoFactorLoginForm />
        </Suspense>
    );
}
