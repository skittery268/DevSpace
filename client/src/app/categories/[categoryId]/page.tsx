import { CategoryProducts } from "@/components/category/CategoryProducts";

export default async function CategoryPage({
    params,
}: PageProps<"/categories/[categoryId]">) {
    const { categoryId } = await params;

    return <CategoryProducts categoryId={categoryId} />;
}
