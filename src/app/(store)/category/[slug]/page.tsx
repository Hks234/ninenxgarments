import { notFound } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { prisma } from "@/lib/prisma";
import { getShopProducts } from "@/lib/storefront";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug, isActive: true, deletedAt: null } });
  return { title: category?.name || "Category" };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findFirst({ where: { slug, isActive: true, deletedAt: null } });
  if (!category) notFound();
  const { products } = await getShopProducts({ category: slug, page: "1" }, 24);
  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">{category.name}</h1>
      {category.description && <p className="mb-8 max-w-3xl text-[#b4b4ae]">{category.description}</p>}
      {products.length === 0 ? (
        <p>No products in this category yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
