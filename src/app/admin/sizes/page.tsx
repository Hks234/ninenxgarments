"use client";

import { useEffect, useState } from "react";

export default function AdminSizesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/admin/sizes").then((r) => r.json());
    setItems(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-5xl">Size management</h1>
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const response = await fetch("/api/admin/sizes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ label }),
          });
          const data = await response.json();
          if (!response.ok) return setError(data.error);
          setLabel("");
          load();
        }}
      >
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Size label, e.g. M" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <button className="bg-[#c8b273] px-4 text-black">Add</button>
      </form>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between border border-[#2a2a2a] p-3">
          <span>{item.label}</span>
          <div className="flex gap-3 text-sm">
            <button
              onClick={async () => {
                await fetch("/api/admin/sizes", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: item.id, isActive: !item.isActive }),
                });
                load();
              }}
            >
              {item.isActive ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={async () => {
                const response = await fetch("/api/admin/sizes", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: item.id }),
                });
                const data = await response.json();
                if (!response.ok) return setError(data.error);
                load();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
