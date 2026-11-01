"use client";

import { useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/admin/categories").then((r) => r.json());
    setCategories(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const form = new FormData();
    form.set("name", name);
    form.set("description", description);
    if (file) form.set("image", file);
    const response = await fetch("/api/admin/categories", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setName("");
    setDescription("");
    setFile(null);
    load();
  }

  async function update(category: { id: string; name: string; description?: string | null; isActive: boolean }, extra?: FormData) {
    setError("");
    const form = extra || new FormData();
    form.set("name", category.name);
    form.set("description", category.description || "");
    form.set("isActive", String(category.isActive));
    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "PATCH", body: form });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    load();
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="mb-6 font-display text-5xl">Categories</h1>
        <div className="space-y-3">
          {categories.map((category) => (
            <article key={category.id} className="border border-[#2a2a2a] p-4">
              {category.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={category.imageUrl} alt="" className="mb-3 h-24 w-full object-cover" />
              )}
              <input
                defaultValue={category.name}
                className="w-full border border-[#2a2a2a] bg-black px-3 py-2"
                onBlur={(e) => update({ ...category, name: e.target.value })}
              />
              <p className="mt-2 text-sm text-[#b4b4ae]">{category._count?.products || 0} products · {category.isActive ? "Visible" : "Hidden"}</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <button onClick={() => update({ ...category, isActive: !category.isActive })}>
                  {category.isActive ? "Hide" : "Show"}
                </button>
                <label className="text-[#c8b273]">
                  Replace image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    className="block"
                    onChange={(e) => {
                      const next = e.target.files?.[0];
                      if (!next) return;
                      const form = new FormData();
                      form.set("image", next);
                      update(category, form);
                    }}
                  />
                </label>
                <button
                  className="text-red-300"
                  onClick={async () => {
                    const response = await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
                    const data = await response.json();
                    if (!response.ok) return setError(data.error);
                    load();
                  }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      <form onSubmit={create} className="space-y-3">
        <h2 className="font-display text-3xl">Add category</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-24 w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="bg-[#c8b273] px-5 py-2 text-black">Save category</button>
      </form>
    </div>
  );
}
