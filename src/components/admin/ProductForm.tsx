"use client";

import { useEffect, useMemo, useState } from "react";
import { paiseToRupeeNumber } from "@/lib/money";

type Option = { id: string; name?: string; label?: string; isActive?: boolean };
type Product = {
  id: string;
  name: string;
  description?: string | null;
  categoryId: string;
  pricePaise: number;
  isActive: boolean;
  isFeatured: boolean;
  images: { url?: string | null }[];
  variants: { sizeId: string; colourId: string; stock: number }[];
};

export function ProductForm({ productId }: { productId?: string }) {
  const [categories, setCategories] = useState<Option[]>([]);
  const [sizes, setSizes] = useState<Option[]>([]);
  const [colours, setColours] = useState<Option[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priceRupees, setPriceRupees] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [stockMap, setStockMap] = useState<Record<string, number>>({});
  const [files, setFiles] = useState<FileList | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/sizes").then((r) => r.json()),
      fetch("/api/admin/colours").then((r) => r.json()),
      productId ? fetch(`/api/admin/products/${productId}`).then((r) => r.json()) : Promise.resolve(null),
    ]).then(([cats, sizeList, colourList, product]: [any, any, any, Product | null]) => {
      setCategories(cats);
      setSizes(sizeList);
      setColours(colourList);
      if (product && product.id) {
        setName(product.name);
        setDescription(product.description || "");
        setCategoryId(product.categoryId);
        setPriceRupees(String(paiseToRupeeNumber(product.pricePaise)));
        setIsActive(product.isActive);
        setIsFeatured(product.isFeatured);
        setSelectedSizes([...new Set(product.variants.map((v) => v.sizeId))]);
        setSelectedColours([...new Set(product.variants.map((v) => v.colourId))]);
        const next: Record<string, number> = {};
        product.variants.forEach((variant) => {
          next[`${variant.sizeId}:${variant.colourId}`] = variant.stock;
        });
        setStockMap(next);
        setExistingImages(product.images.map((image) => image.url).filter(Boolean) as string[]);
      }
    });
  }, [productId]);

  const combos = useMemo(
    () => selectedSizes.flatMap((sizeId) => selectedColours.map((colourId) => ({ sizeId, colourId }))),
    [selectedSizes, selectedColours],
  );

  function toggle(list: string[], id: string, setter: (value: string[]) => void) {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const variants = combos.map((combo) => ({
      sizeId: combo.sizeId,
      colourId: combo.colourId,
      stock: Number(stockMap[`${combo.sizeId}:${combo.colourId}`] || 0),
    }));
    const form = new FormData();
    form.set("name", name);
    form.set("description", description);
    form.set("categoryId", categoryId);
    form.set("priceRupees", priceRupees);
    form.set("isActive", String(isActive));
    form.set("isFeatured", String(isFeatured));
    form.set("variants", JSON.stringify(variants));
    if (files) {
      Array.from(files).forEach((file) => form.append("images", file));
    }
    const response = await fetch(productId ? `/api/admin/products/${productId}` : "/api/admin/products", {
      method: productId ? "PATCH" : "POST",
      body: form,
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not save product");
    setMessage("Product saved.");
    if (!productId && data.id) window.location.href = `/admin/products/${data.id}`;
  }

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
      <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border border-[#2a2a2a] bg-black px-3 py-2">
        <option value="">Select category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {(category as { name: string }).name}
          </option>
        ))}
      </select>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="h-32 w-full border border-[#2a2a2a] bg-black px-3 py-2" />
      <input value={priceRupees} onChange={(e) => setPriceRupees(e.target.value)} placeholder="Price in rupees" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Featured
      </label>
      <div>
        <p className="mb-2 text-sm text-[#c8b273]">Sizes</p>
        <div className="flex flex-wrap gap-2">
          {sizes.filter((size) => size.isActive !== false).map((size) => (
            <button type="button" key={size.id} onClick={() => toggle(selectedSizes, size.id, setSelectedSizes)} className={`border px-3 py-1 ${selectedSizes.includes(size.id) ? "border-[#c8b273] text-[#c8b273]" : "border-[#2a2a2a]"}`}>
              {size.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-[#c8b273]">Colours</p>
        <div className="flex flex-wrap gap-2">
          {colours.filter((colour) => colour.isActive !== false).map((colour) => (
            <button type="button" key={colour.id} onClick={() => toggle(selectedColours, colour.id, setSelectedColours)} className={`border px-3 py-1 ${selectedColours.includes(colour.id) ? "border-[#c8b273] text-[#c8b273]" : "border-[#2a2a2a]"}`}>
              {colour.name}
            </button>
          ))}
        </div>
      </div>
      {combos.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-[#c8b273]">Stock by size and colour</p>
          {combos.map((combo) => {
            const size = sizes.find((item) => item.id === combo.sizeId);
            const colour = colours.find((item) => item.id === combo.colourId);
            const key = `${combo.sizeId}:${combo.colourId}`;
            return (
              <label key={key} className="flex items-center justify-between gap-4 border border-[#2a2a2a] px-3 py-2 text-sm">
                <span>
                  {size?.label} / {colour?.name}
                </span>
                <input
                  type="number"
                  min={0}
                  value={stockMap[key] ?? 0}
                  onChange={(e) => setStockMap({ ...stockMap, [key]: Number(e.target.value) })}
                  className="w-24 border border-[#2a2a2a] bg-black px-2 py-1"
                />
              </label>
            );
          })}
        </div>
      )}
      {existingImages.length > 0 && (
        <div className="flex gap-3">
          {existingImages.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" className="h-20 w-20 object-cover" />
          ))}
        </div>
      )}
      <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple onChange={(e) => setFiles(e.target.files)} />
      {error && <p className="text-sm text-red-300">{error}</p>}
      {message && <p className="text-sm text-[#c8b273]">{message}</p>}
      <button className="bg-[#c8b273] px-6 py-3 text-black">{productId ? "Update product" : "Create product"}</button>
    </form>
  );
}
