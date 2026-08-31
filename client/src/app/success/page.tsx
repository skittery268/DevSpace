import type { Metadata } from "next";

import { CheckoutSuccess } from "@/components/checkout/CheckoutOutcome";
import { Container } from "@/components/common/Container";
import { getServerTranslation } from "@/i18n/server";
import { NOINDEX } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
    const { t } = await getServerTranslation();
    return {
        robots: NOINDEX,
        title: t("checkout.successTitle"),
    };
}

/**
 * Stripe's `success_url` (STRIPE_SUCCESS_URL on the server) points here.
 *
 * The redirect carries no session id and never touches the backend, so this
 * page cannot confirm anything by itself — the order appears once Stripe's
 * webhook reaches `POST /payment/webhook`.
 */
export default function SuccessPage() {
    return (
        <Container className="py-16">
            <CheckoutSuccess />
        </Container>
    );
}
