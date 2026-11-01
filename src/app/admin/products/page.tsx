"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [q, setQ] = useState("");

  async function load(search = q) {
    const data = await fetch(`/api/admin/products?q=${encodeURIComponent(search)}`).then((r) => r.json());
    setProducts(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load("");
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl">Products</h1>
        <Link href="/admin/products/new" className="bg-[#c8b273] px-4 py-2 text-black">
          Add product
        </Link>
      </div>
      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="w-full max-w-sm border border-[#2a2a2a] bg-black px-3 py-2" />
        <button className="border border-[#c8b273] px-4">Search</button>
      </form>
      <div className="space-y-3">
        {products.map((product) => (
          <div key={product.id} className="flex items-center justify-between border border-[#2a2a2a] p-4">
            <div>
              <p className="font-display text-2xl">{product.name}</p>
              <p className="text-sm text-[#b4b4ae]">
                {product.category?.name} · {formatInr(product.pricePaise)} · {product.isActive ? "Active" : "Hidden"}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/products/${product.id}`} className="text-[#c8b273]">
                Edit
              </Link>
              <button
                onClick={async () => {
                  await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
                  load();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
