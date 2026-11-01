import Link from "next/link";
import { formatInr } from "@/lib/money";
import { AddToCartButton } from "./AddToCartButton";

type Product = {
  id: string;
  slug: string;
  name: string;
  pricePaise: number;
  imageUrl: string | null;
  availableSizes: { id: string; label: string }[];
  availableColours: { id: string; name: string; hex: string | null }[];
  variants: { id: string; stock: number; size: { id: string }; colour: { id: string } }[];
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="luxury-card group border border-[#2a2a2a] bg-[#111] p-3">
      <Link href={`/product/${product.slug}`} className="block overflow-hidden bg-[#0a0a0a]">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt={product.name} className="aspect-[3/4] w-full object-cover transition duration-700 group-hover:scale-105" />
        ) : (
          <div className="flex aspect-[3/4] items-center justify-center text-sm text-[#b4b4ae]">No image</div>
        )}
      </Link>
      <div className="space-y-2 pt-4">
        <h3 className="font-display text-xl">{product.name}</h3>
        <p className="text-[#c8b273]">{formatInr(product.pricePaise)}</p>
        {product.availableSizes.length > 0 && (
          <p className="text-xs uppercase tracking-wider text-[#b4b4ae]">
            Sizes: {product.availableSizes.map((s) => s.label).join(", ")}
          </p>
        )}
        {product.availableColours.length > 0 && (
          <p className="text-xs uppercase tracking-wider text-[#b4b4ae]">
            Colours: {product.availableColours.map((c) => c.name).join(", ")}
          </p>
        )}
        <div className="flex gap-2 pt-2">
          <Link href={`/product/${product.slug}`} className="flex-1 border border-[#c8b273] px-3 py-2 text-center text-xs uppercase tracking-wider">
            View Product
          </Link>
          <AddToCartButton product={product} compact />
        </div>
      </div>
    </article>
  );
}
