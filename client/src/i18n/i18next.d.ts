import type { DEFAULT_NS } from "./instance";
import type { Translation } from "./locales/en";

/**
 * Makes every `t("…")` call check its key against the English catalog, so a
 * typo or a renamed key is a build error rather than a raw key rendered to the
 * user. `ru.ts` and `ka.ts` are typed as `Translation`, which keeps all three
 * catalogs in lockstep.
 */
declare module "i18next" {
    interface CustomTypeOptions {
        defaultNS: typeof DEFAULT_NS;
        resources: { translation: Translation };
    }
}
