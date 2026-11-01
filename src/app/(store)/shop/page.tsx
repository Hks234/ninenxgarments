import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { getActiveCategories, getFilterOptions, getShopProducts } from "@/lib/storefront";

export const metadata = { title: "Shop" };

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = {
    q: String(params.q || ""),
    category: String(params.category || ""),
    size: String(params.size || ""),
    colour: String(params.colour || ""),
    min: String(params.min || ""),
    max: String(params.max || ""),
    sort: String(params.sort || "newest"),
    page: String(params.page || "1"),
  };
  const [{ products, total, page, pageCount }, categories, options] = await Promise.all([
    getShopProducts(filters),
    getActiveCategories(),
    getFilterOptions(),
  ]);

  function href(next: Record<string, string>) {
    const query = new URLSearchParams({ ...filters, page: "1", ...next });
    [...query.entries()].forEach(([key, value]) => {
      if (!value) query.delete(key);
    });
    return `/shop?${query.toString()}`;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <form className="h-fit space-y-4 border border-[#2a2a2a] bg-[#111] p-4" action="/shop">
        <h1 className="font-display text-3xl">Shop</h1>
        <input name="q" defaultValue={filters.q} placeholder="Search products" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <select name="category" defaultValue={filters.category} className="w-full border border-[#2a2a2a] bg-black px-3 py-2">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.slug}>{category.name}</option>
          ))}
        </select>
        <select name="size" defaultValue={filters.size} className="w-full border border-[#2a2a2a] bg-black px-3 py-2">
          <option value="">All sizes</option>
          {options.sizes.map((size) => (
            <option key={size.id} value={size.slug}>{size.label}</option>
          ))}
        </select>
        <select name="colour" defaultValue={filters.colour} className="w-full border border-[#2a2a2a] bg-black px-3 py-2">
          <option value="">All colours</option>
          {options.colours.map((colour) => (
            <option key={colour.id} value={colour.slug}>{colour.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input name="min" defaultValue={filters.min} placeholder="Min ₹" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
          <input name="max" defaultValue={filters.max} placeholder="Max ₹" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        </div>
        <select name="sort" defaultValue={filters.sort} className="w-full border border-[#2a2a2a] bg-black px-3 py-2">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
        <button className="btn-gold w-full bg-[#c8b273] py-2 text-black">Apply</button>
        <Link href="/shop" className="block text-center text-sm text-[#c8b273]">Clear Filters</Link>
      </form>
      <div>
        <p className="mb-6 text-sm text-[#b4b4ae]">{total} products</p>
        {products.length === 0 ? (
          <div className="border border-[#2a2a2a] p-10 text-center">
            <p>No products match these filters.</p>
            <Link href="/shop" className="mt-4 inline-block text-[#c8b273]">Clear Filters</Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-8 flex justify-center gap-3">
          {page > 1 && <Link href={href({ page: String(page - 1) })} className="border border-[#2a2a2a] px-4 py-2">Previous</Link>}
          <span className="px-4 py-2 text-sm">Page {page} of {pageCount}</span>
          {page < pageCount && <Link href={href({ page: String(page + 1) })} className="border border-[#2a2a2a] px-4 py-2">Next</Link>}
        </div>
      </div>
    </div>
  );
}
