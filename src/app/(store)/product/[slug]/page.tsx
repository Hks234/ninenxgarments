import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/store/AddToCartButton";
import { ProductCard } from "@/components/store/ProductCard";
import { formatInr } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getProductBySlug, serializeProduct } from "@/lib/storefront";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description || `${product.name} from NINE XN GARMENTS`,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const relatedRaw = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, deletedAt: null, id: { not: product.id } },
    include: { images: true, category: true, variants: { include: { size: true, colour: true } } },
    take: 4,
  });
  const related = relatedRaw.map(serializeProduct);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-3">
        {product.images.some((image) => image.url) ? (
          product.images.map((image, index) =>
            image.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={index} src={image.url} alt={image.alt || product.name} className="w-full border border-[#2a2a2a] object-cover transition duration-700 hover:scale-[1.02]" />
            ) : null,
          )
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center border border-[#2a2a2a] bg-[#111] text-[#b4b4ae]">
            Product image will appear here once it is uploaded in the admin dashboard.
          </div>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[#c8b273]">{product.category.name}</p>
        <h1 className="mt-3 font-display text-5xl">{product.name}</h1>
        <p className="mt-4 text-2xl text-[#c8b273]">{formatInr(product.pricePaise)}</p>
        {product.description && <p className="mt-6 leading-8 text-[#b4b4ae]">{product.description}</p>}
        <div className="mt-8 space-y-4">
          <AddToCartButton product={product} />
          <AddToCartButton product={product} buyNow />
        </div>
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-3xl">Related products</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
