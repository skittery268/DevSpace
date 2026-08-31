import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("auth.signUp"),
    };
}

export default function RegisterPage() {
    return <RegisterForm />;
}
