import { absoluteUrl, APP_NAME, SITE_URL } from "./seo";
import { CURRENCY } from "./constants";
import type { Category } from "@/types/category.types";
import type { Product } from "@/types/product.types";

/**
 * Schema.org builders.
 *
 * The one rule this file follows: every property is either a constant about the
 * site itself or a value the API actually returned and the page actually
 * renders. Nothing is estimated, rounded up, or filled in with a plausible
 * default — structured data that disagrees with the page is a manual-action
 * risk, not an optimisation.
 *
 * Two things a shop schema usually carries are deliberately absent:
 *
 *   - `aggregateRating` / `review`. The backend stores no average and exposes
 *     no aggregate endpoint (see `ReviewSection`, which for the same reason
 *     only ever shows the mean of the reviews it has loaded). A rating computed
 *     from one page of reviews is not the product's rating, so none is emitted.
 *   - `WebSite.potentialAction` (sitelinks search box). Every `/search`
 *     endpoint sits behind `protect`, so the search URL a crawler would be
 *     handed answers 401 for anyone not signed in.
 */

export type JsonLd = Record<string, unknown>;

/** Stable `@id`s, so the graph nodes can reference each other. */
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export function organizationSchema(description: string): JsonLd {
    return {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: APP_NAME,
        url: SITE_URL,
        description,
    };
}

export function websiteSchema(description: string, locale: string): JsonLd {
    return {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: APP_NAME,
        url: SITE_URL,
        description,
        inLanguage: locale,
        publisher: { "@id": ORGANIZATION_ID },
    };
}

/** One crumb per link in the visible breadcrumb, in the same order. */
export function breadcrumbSchema(
    trail: Array<{ name: string; path: string }>,
): JsonLd {
    return {
        "@type": "BreadcrumbList",
        itemListElement: trail.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
        })),
    };
}

/**
 * A product exactly as the detail page shows it.
 *
 * `offers.availability` mirrors the in-stock badge, `price` the figure beside
 * it, and `seller` the name in the "About the seller" card — so a validator
 * comparing the markup against the rendered page finds the same values.
 */
export function productSchema(product: Product, description: string): JsonLd {
    const url = absoluteUrl(`/products/${product.id}`);

    const schema: JsonLd = {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.title,
        description,
        url,
        // Mongo's `_id`, which is the only stable identifier a listing carries.
        productID: product.id,
        offers: {
            "@type": "Offer",
            url,
            price: product.price,
            priceCurrency: CURRENCY,
            availability: `https://schema.org/${product.stock > 0 ? "InStock" : "OutOfStock"}`,
            ...(product.seller
                ? { seller: { "@type": "Person", name: product.seller.fullname } }
                : {}),
        },
    };

    // Cloudinary and Unsplash URLs are already absolute; a listing with no
    // successful upload has none, and an empty `image` is worse than no key.
    if (product.images.length > 0) schema.image = product.images;
    if (product.category) schema.category = product.category.name;

    // `attributes` is validated as Record<string, string> and rendered in the
    // spec table, so each entry is a property the page genuinely states.
    const attributes = Object.entries(product.attributes);
    if (attributes.length > 0) {
        schema.additionalProperty = attributes.map(([name, value]) => ({
            "@type": "PropertyValue",
            name,
            value: String(value),
        }));
    }

    return schema;
}

/**
 * A category listing page.
 *
 * `CollectionPage` rather than `ItemList`: the page is a paginated slice of a
 * category, and only the current slice is on screen. `numberOfItems` is the
 * total the page itself prints above the grid.
 */
export function categoryCollectionSchema(
    category: Category,
    description: string,
    totalProducts: number | null,
): JsonLd {
    const url = absoluteUrl(`/categories/${category.id}`);

    return {
        "@type": "CollectionPage",
        "@id": `${url}#collection`,
        name: category.name,
        description,
        url,
        isPartOf: { "@id": WEBSITE_ID },
        ...(category.imageUrl ? { image: category.imageUrl } : {}),
        ...(totalProducts !== null ? { numberOfItems: totalProducts } : {}),
    };
}

/** Wraps the nodes in the `@graph` envelope a single script tag carries. */
export function jsonLdGraph(...nodes: JsonLd[]): JsonLd {
    return { "@context": "https://schema.org", "@graph": nodes };
}
