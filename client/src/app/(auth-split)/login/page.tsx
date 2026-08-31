import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { Spinner } from "@/components/ui/Spinner";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("auth.signIn"),
    };
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[60dvh] items-center justify-center py-16">
                    <Spinner className="size-6 text-brand-500" />
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
