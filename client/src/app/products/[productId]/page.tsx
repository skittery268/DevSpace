import { ProductDetail } from "@/components/product/ProductDetail";

export default async function ProductPage({
    params,
}: PageProps<"/products/[productId]">) {
    const { productId } = await params;

    return <ProductDetail productId={productId} />;
}
