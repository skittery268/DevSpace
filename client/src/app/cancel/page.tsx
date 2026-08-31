import type { Metadata } from "next";

import { CheckoutCancel } from "@/components/checkout/CheckoutOutcome";
import { Container } from "@/components/common/Container";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("checkout.cancelTitle"),
    };
}

/** Stripe's `cancel_url` (STRIPE_CANCEL_URL on the server) points here. */
export default function CancelPage() {
    return (
        <Container className="py-16">
            <CheckoutCancel />
        </Container>
    );
}
