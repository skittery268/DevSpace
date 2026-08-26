import type { TFunction } from "i18next";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { ApiError, FORM_ERROR_KEY, resolveErrorMessage } from "./api-error";

/**
 * Bridges a failed request into React Hook Form.
 *
 * Field-level messages from the backend's Zod middleware land on the matching
 * input; anything else (an AppError, an object-level Zod issue, a network
 * failure) is returned so the caller can render it as a form-level alert.
 *
 * `t` is passed in because the fallbacks this produces are the client's own
 * words; the per-field messages come from the backend's validator and are
 * shown exactly as sent.
 */
export function applyServerErrors<TValues extends FieldValues>(
    t: TFunction,
    error: unknown,
    setError: UseFormSetError<TValues>,
    knownFields: ReadonlyArray<Path<TValues>>,
): string | null {
    if (!(error instanceof ApiError)) {
        return resolveErrorMessage(error, t);
    }

    if (!error.fieldErrors) return resolveErrorMessage(error, t);

    let formMessage: string | null = null;
    let matchedAny = false;

    for (const [field, message] of Object.entries(error.fieldErrors)) {
        if (field === FORM_ERROR_KEY) {
            formMessage = message;
            continue;
        }
        if (knownFields.includes(field as Path<TValues>)) {
            setError(field as Path<TValues>, { type: "server", message });
            matchedAny = true;
        } else {
            // A field the form does not render (for example a nested `userInfo.city`
            // path) still has to reach the user somehow.
            formMessage = formMessage ? `${formMessage} ${message}` : message;
        }
    }

    if (formMessage) return formMessage;
    return matchedAny ? null : resolveErrorMessage(error, t);
}
