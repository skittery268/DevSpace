import type { JsonLd as JsonLdObject } from "@/lib/structured-data";

/**
 * Renders a Schema.org graph into the document.
 *
 * A server component on purpose: structured data is only useful if it is in the
 * HTML the crawler is served, so this must never end up behind a client
 * boundary that fills in after hydration.
 *
 * Product titles and descriptions are seller-supplied, so `<` is escaped before
 * the JSON reaches the page. Without it a listing named `</script><img onerror>`
 * would close this tag early — the payload is untrusted text, not markup.
 */
export function JsonLd({ data }: { data: JsonLdObject }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}
