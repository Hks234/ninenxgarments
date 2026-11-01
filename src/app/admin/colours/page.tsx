"use client";

import { useEffect, useState } from "react";

export default function AdminColoursPage() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/admin/colours").then((r) => r.json());
    setItems(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-5xl">Colour management</h1>
      <form
        className="grid gap-2 sm:grid-cols-[1fr_120px_auto]"
        onSubmit={async (e) => {
          e.preventDefault();
          const response = await fetch("/api/admin/colours", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, hex }),
          });
          const data = await response.json();
          if (!response.ok) return setError(data.error);
          setName("");
          setHex("");
          load();
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Colour name" className="border border-[#2a2a2a] bg-black px-3 py-2" />
        <input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#000000" className="border border-[#2a2a2a] bg-black px-3 py-2" />
        <button className="bg-[#c8b273] px-4 py-2 text-black">Add</button>
      </form>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center justify-between border border-[#2a2a2a] p-3">
          <span className="flex items-center gap-3">
            <span className="h-5 w-5 border border-[#2a2a2a]" style={{ background: item.hex || "#111" }} />
            {item.name}
          </span>
          <div className="flex gap-3 text-sm">
            <button
              onClick={async () => {
                await fetch("/api/admin/colours", {
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
                const response = await fetch("/api/admin/colours", {
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
