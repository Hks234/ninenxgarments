"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Product = {
  id: string;
  slug?: string;
  variants: { id: string; stock: number; size: { id: string; label?: string }; colour: { id: string; name?: string } }[];
  availableSizes?: { id: string; label: string }[];
  availableColours?: { id: string; name: string }[];
};

export function AddToCartButton({
  product,
  compact,
  buyNow,
}: {
  product: Product;
  compact?: boolean;
  buyNow?: boolean;
}) {
  const sizes = product.availableSizes || [];
  const colours = product.availableColours || [];
  const [sizeId, setSizeId] = useState(sizes[0]?.id || "");
  const [colourId, setColourId] = useState(colours[0]?.id || "");
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState("");

  const variant = useMemo(
    () => product.variants.find((item) => item.size.id === sizeId && item.colour.id === colourId),
    [product.variants, sizeId, colourId],
  );

  async function add() {
    setMessage("");
    if (!variant) {
      setMessage("Select an available size and colour.");
      return;
    }
    if (variant.stock < 1) {
      setMessage("This combination is out of stock.");
      return;
    }
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, variantId: variant.id, quantity: qty }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error || "Could not add to cart");
      if (response.status === 401) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
      return;
    }
    window.dispatchEvent(new Event("cart-updated"));
    if (buyNow) window.location.href = "/checkout";
    else setMessage("Added to cart");
  }

  if (compact && product.slug) {
    return (
      <Link
        href={`/product/${product.slug}`}
        className="px-3 py-2 text-xs bg-[#c8b273] text-black uppercase tracking-wider"
      >
        Add to Cart
      </Link>
    );
  }

  return (
    <div className={compact ? "" : "space-y-4"}>
      {!compact && (
        <>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSizeId(size.id)}
                className={`border px-3 py-1 text-sm ${sizeId === size.id ? "border-[#c8b273] text-[#c8b273]" : "border-[#2a2a2a]"}`}
              >
                {size.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {colours.map((colour) => (
              <button
                key={colour.id}
                onClick={() => setColourId(colour.id)}
                className={`border px-3 py-1 text-sm ${colourId === colour.id ? "border-[#c8b273] text-[#c8b273]" : "border-[#2a2a2a]"}`}
              >
                {colour.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label>Qty</label>
            <input
              type="number"
              min={1}
              max={variant?.stock || 1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-20 border border-[#2a2a2a] bg-black px-2 py-1"
            />
            <span className="text-sm text-[#b4b4ae]">
              {variant ? (variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock") : "Select options"}
            </span>
          </div>
        </>
      )}
      <button
        onClick={add}
        className={`${compact ? "px-3 py-2 text-xs" : "w-full px-5 py-3"} bg-[#c8b273] text-black uppercase tracking-wider`}
      >
        {buyNow ? "Buy Now" : "Add to Cart"}
      </button>
      {message && <p className="pt-2 text-xs text-[#c8b273]">{message}</p>}
    </div>
  );
}
