import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { ApiError } from "@/lib/api-error";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getServerTranslation } from "@/i18n/server";
import { APP_NAME } from "@/lib/constants";
import { loadProduct, loadProductForMetadata } from "@/lib/seo-data";
import {
    absoluteUrl,
    OG_LOCALES,
    toMetaDescription,
    toMetaTitle,
} from "@/lib/seo";
import {
    breadcrumbSchema,
    jsonLdGraph,
    productSchema,
} from "@/lib/structured-data";

/**
 * Metadata for a single listing, built from the listing itself.
 *
 * Everything a seller writes is untrusted input for these purposes: a title can
 * be one character or three hundred, a description can be empty or several
 * paragraphs of newlines, and a listing can have no image at all. `toMetaTitle`
 * and `toMetaDescription` normalise the first two; the image block below
 * handles the third by falling through to the site card, which the root layout
 * already provides.
 */
export async function generateMetadata({
    params,
}: PageProps<"/products/[productId]">): Promise<Metadata> {
    const { productId } = await params;
    const { t, locale } = await getServerTranslation();
    const product = await loadProductForMetadata(productId);

    const canonical = `/products/${productId}`;

    /**
     * A listing that is gone, or a backend that cannot be reached. The page
     * body decides which of the two it is; metadata only has to avoid claiming
     * a title it does not have, and avoid inviting an index of an empty page.
     */
    if (!product) {
        return {
            title: t("products.notFound"),
            robots: { index: false, follow: true },
            alternates: { canonical },
        };
    }

    // The category is part of the title only when there is one, so an
    // uncategorised listing gets its bare name rather than a dangling dash.
    const name = toMetaTitle(product.title, t("products.title"));
    const title = product.category
        ? t("seo.productTitleWithCategory", {
              title: name,
              category: product.category.name,
          })
        : name;

    const description = toMetaDescription(
        product.description,
        t("seo.productDescriptionFallback", { title: name, app: APP_NAME }),
    );

    const image = product.images[0];

    return {
        title,
        description,
        alternates: { canonical },
        openGraph: {
            // `product` is not in Next's OpenGraphType union; `website` is the
            // honest fallback and the Product JSON-LD below carries the detail.
            type: "website",
            title,
            description,
            url: absoluteUrl(canonical),
            locale: OG_LOCALES[locale],
            // Omitted entirely when the listing has no upload, so the root
            // layout's site card is inherited instead of an empty tag.
            ...(image ? { images: [{ url: image, alt: product.title }] } : {}),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            ...(image ? { images: [image] } : {}),
        },
    };
}

export default async function ProductPage({
    params,
}: PageProps<"/products/[productId]">) {
    const { productId } = await params;
    const { t } = await getServerTranslation();

    /**
     * A deleted listing has to answer 404, not 200.
     *
     * `ProductDetail` renders its own "not found" state, but it does so inside
     * a successful response — a soft 404, which leaves the URL indexable and
     * competing with the listings that still exist. Resolving the product here
     * turns a missing one into a real status code. `loadProduct` is memoised
     * per request, so this shares the fetch `generateMetadata` already made.
     *
     * Only a genuine 404 is treated this way: any other failure falls through
     * to the client, which renders a retryable error rather than telling a
     * crawler the catalog is gone because the API blinked.
     */
    let product: Awaited<ReturnType<typeof loadProduct>> | null = null;
    try {
        product = await loadProduct(productId);
    } catch (error) {
        if (error instanceof ApiError && error.isNotFound) notFound();
    }

    return (
        <>
            {product ? (
                <JsonLd
                    data={jsonLdGraph(
                        productSchema(
                            product,
                            toMetaDescription(
                                product.description,
                                t("seo.productDescriptionFallback", {
                                    title: product.title,
                                    app: APP_NAME,
                                }),
                            ),
                        ),
                        // Mirrors the breadcrumb `ProductDetail` renders.
                        breadcrumbSchema([
                            { name: t("nav.products"), path: "/products" },
                            ...(product.category
                                ? [
                                      {
                                          name: product.category.name,
                                          path: `/categories/${product.category.id}`,
                                      },
                                  ]
                                : []),
                            { name: product.title, path: `/products/${product.id}` },
                        ]),
                    )}
                />
            ) : null}
            <ProductDetail productId={productId} />
        </>
    );
}
