import Link from "next/link";
import { getActiveCategories } from "@/lib/storefront";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getActiveCategories();
  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">Categories</h1>
      {categories.length === 0 ? (
        <p className="text-[#b4b4ae]">No active categories yet.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="luxury-card overflow-hidden border border-[#2a2a2a]">
              {category.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={category.imageUrl} alt={category.name} className="h-64 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center bg-[#111] text-sm text-[#b4b4ae]">No image</div>
              )}
              <div className="flex items-center justify-between p-4">
                <h2 className="font-display text-3xl">{category.name}</h2>
                <span className="text-xs uppercase tracking-wider text-[#c8b273]">Shop Category</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
