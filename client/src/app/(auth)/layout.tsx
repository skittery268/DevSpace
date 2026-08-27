import type { ReactNode } from "react";

import { AuroraBackdrop } from "@/components/common/Container";
import { Logo } from "@/components/layout/Logo";

/**
 * The narrow centred card, for the screens that interrupt a flow: password
 * reset and the 2FA challenge.
 *
 * Sign-in and sign-up live in the `(auth-split)` group instead, which has no
 * layout of its own because each of those pages brings the split frame with it.
 * They are front doors and get the brand plane; a "your code expired" screen
 * behind a full marketing panel would read as a landing page.
 *
 * Route-group layouts are not part of the generated `LayoutRoutes` union, so
 * the props are typed directly rather than through the `LayoutProps` helper.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="relative isolate flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-14">
            <AuroraBackdrop />
            <div className="w-full max-w-md">
                <div className="mb-7 flex justify-center">
                    <Logo size="lg" />
                </div>
                {children}
            </div>
        </div>
    );
}
