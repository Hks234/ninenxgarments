"use client";

import { useEffect, useState } from "react";

export default function AdminInventoryPage() {
  const [data, setData] = useState<{ variants: any[]; movements: any[] } | null>(null);
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  async function load(search = q) {
    const json = await fetch(`/api/admin/inventory?q=${encodeURIComponent(search)}`).then((r) => r.json());
    setData(json);
  }
  useEffect(() => {
    load("");
  }, []);

  if (!data) return <p>Loading inventory…</p>;

  return (
    <div className="space-y-10">
      <h1 className="font-display text-5xl">Inventory</h1>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by product" className="w-full max-w-sm border border-[#2a2a2a] bg-black px-3 py-2" />
        <button className="border border-[#c8b273] px-4">Search</button>
      </form>
      {error && <p className="text-sm text-red-300">{error}</p>}
      <div className="space-y-3">
        {data.variants.map((variant) => (
          <form
            key={variant.id}
            className="grid items-center gap-3 border border-[#2a2a2a] p-3 md:grid-cols-[1fr_120px_auto]"
            onSubmit={async (e) => {
              e.preventDefault();
              const stock = Number((e.currentTarget.elements.namedItem("stock") as HTMLInputElement).value);
              const response = await fetch("/api/admin/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ variantId: variant.id, stock }),
              });
              const json = await response.json();
              if (!response.ok) return setError(json.error);
              load();
            }}
          >
            <p>
              {variant.product.name} · {variant.size.label} / {variant.colour.name}
            </p>
            <input name="stock" type="number" min={0} defaultValue={variant.stock} className="border border-[#2a2a2a] bg-black px-2 py-1" />
            <button className="border border-[#c8b273] px-3 py-1 text-sm">Save stock</button>
          </form>
        ))}
      </div>
      <section>
        <h2 className="mb-4 font-display text-3xl">Recent movements</h2>
        <div className="space-y-2 text-sm">
          {data.movements.map((movement) => (
            <p key={movement.id} className="border border-[#2a2a2a] p-3">
              {movement.type} · {movement.quantity} · {movement.variant?.product?.name} · {new Date(movement.createdAt).toLocaleString()}
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
