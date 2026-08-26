"use client";

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { resolveErrorMessage } from "@/lib/api-error";

/**
 * Turns anything thrown by a request into a sentence in the current language.
 *
 * Every dialog and inline alert that renders `mutation.error` goes through this
 * rather than reading `.message`, so a network failure or a 403 reads in the
 * user's language while a message the backend wrote is passed through as sent.
 */
export function useErrorMessage() {
    const { t } = useTranslation();
    return useCallback((error: unknown) => resolveErrorMessage(error, t), [t]);
}
