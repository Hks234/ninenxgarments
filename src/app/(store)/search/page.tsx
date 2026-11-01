import { ProductCard } from "@/components/store/ProductCard";
import { getShopProducts } from "@/lib/storefront";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const result = q ? await getShopProducts({ q, page: "1" }, 24) : { products: [], total: 0 };

  return (
    <div>
      <h1 className="mb-6 font-display text-5xl">Search</h1>
      <form className="mb-8 flex gap-3">
        <input name="q" defaultValue={q} placeholder="Search by product name" className="w-full max-w-lg border border-[#2a2a2a] bg-black px-4 py-3" />
        <button className="bg-[#c8b273] px-6 text-black">Search</button>
      </form>
      {!q && <p className="text-[#b4b4ae]">Enter a product name to search the collection.</p>}
      {q && <p className="mb-6 text-sm text-[#b4b4ae]">{result.total} results for “{q}”</p>}
      {q && result.products.length === 0 && <p className="text-[#b4b4ae]">No products match that search.</p>}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {result.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
