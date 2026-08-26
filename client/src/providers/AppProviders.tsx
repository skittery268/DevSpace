"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import type { Locale } from "@/i18n/config";
import { ApiError } from "@/lib/api-error";
import { AuthProvider } from "./AuthProvider";
import { I18nProvider } from "./I18nProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastViewport } from "@/components/ui/Toast";

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 30_000,
                refetchOnWindowFocus: false,
                retry: (failureCount, error) => {
                    // A 401/403/404 is an answer, not a hiccup — retrying only delays the
                    // empty state the user should already be seeing.
                    if (error instanceof ApiError) {
                        if (error.status && error.status >= 400 && error.status < 500) {
                            return false;
                        }
                    }
                    return failureCount < 2;
                },
            },
            mutations: {
                retry: false,
            },
        },
    });
}

export function AppProviders({
    locale,
    children,
}: {
    /** Resolved per request on the server, so the first paint is already right. */
    locale: Locale;
    children: ReactNode;
}) {
    // One client per browser session; created lazily so it is never shared
    // between requests during SSR.
    const [queryClient] = useState(createQueryClient);

    return (
        <QueryClientProvider client={queryClient}>
            <I18nProvider initialLocale={locale}>
                <ThemeProvider>
                    <AuthProvider>
                        {children}
                        <ToastViewport />
                    </AuthProvider>
                </ThemeProvider>
            </I18nProvider>
        </QueryClientProvider>
    );
}
