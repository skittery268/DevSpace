"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/**
 * `googleCallback` redirects a 2FA-enabled account to `${CLIENT_URL}?requires2FA=true`
 * after setting the short-lived `twoFA` cookie. The home page is therefore the
 * landing point for a half-finished Google sign-in, and has to forward the user
 * to the code step.
 */
export function HomeTwoFactorRedirect() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        if (searchParams.get("requires2FA") === "true") {
            router.replace("/two-factor");
        }
    }, [searchParams, router]);

    return null;
}
