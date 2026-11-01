"use client";

import { useEffect, useState } from "react";

export default function AdminHomepagePage() {
  const [config, setConfig] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/admin/homepage").then((r) => r.json()), fetch("/api/admin/products").then((r) => r.json())]).then(
      ([homepage, list]) => {
        setConfig(homepage);
        setProducts(Array.isArray(list) ? list : []);
      },
    );
  }, []);

  if (!config) return <p>Loading homepage settings…</p>;

  return (
    <form
      className="max-w-3xl space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        const formEl = e.currentTarget;
        const form = new FormData(formEl);
        const featured = Array.from(formEl.querySelectorAll<HTMLInputElement>("input[name='featured']:checked")).map((input) => input.value);
        form.set("featuredProductIds", JSON.stringify(featured));
        const response = await fetch("/api/admin/homepage", { method: "POST", body: form });
        const data = await response.json();
        if (!response.ok) return setError(data.error || "Could not save");
        setMessage("Homepage saved.");
      }}
    >
      <h1 className="font-display text-5xl">Homepage</h1>
      {[
        ["heroHeadline", "Hero headline"],
        ["heroSubtext", "Hero subtext"],
        ["heroPrimaryCta", "Primary button"],
        ["heroSecondaryCta", "Secondary button"],
        ["introTitle", "Intro title"],
      ].map(([key, label]) => (
        <label key={key} className="block text-sm text-[#b4b4ae]">
          {label}
          <input name={key} defaultValue={config[key]} className="mt-1 w-full border border-[#2a2a2a] bg-black px-3 py-2 text-white" />
        </label>
      ))}
      <label className="block text-sm text-[#b4b4ae]">
        Intro body
        <textarea name="introBody" defaultValue={config.introBody} className="mt-1 h-32 w-full border border-[#2a2a2a] bg-black px-3 py-2 text-white" />
      </label>
      {[
        ["showReviews", "Show reviews"],
        ["showCategories", "Show categories"],
        ["showInstagram", "Show Instagram"],
        ["showBenefits", "Show benefits"],
        ["showVideos", "Show 9:16 videos"],
      ].map(([key, label]) => (
        <label key={key} className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={key} defaultChecked={config[key]} value="true" /> {label}
        </label>
      ))}
      <p className="text-sm text-[#c8b273]">Featured products</p>
      <div className="space-y-2">
        {products.map((product) => (
          <label key={product.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="featured" value={product.id} defaultChecked={config.featuredProductIds?.includes(product.id)} />
            {product.name}
          </label>
        ))}
      </div>
      <p className="text-sm text-[#b4b4ae]">
        Portrait videos are managed on the{" "}
        <a href="/admin/videos" className="text-[#c8b273] underline">
          Videos
        </a>{" "}
        page. Use 9:16 MP4 files for the homepage reel.
      </p>
      <input type="file" name="heroImage" accept="image/jpeg,image/png,image/webp,image/avif" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      {message && <p className="text-sm text-[#c8b273]">{message}</p>}
      <button className="bg-[#c8b273] px-6 py-3 text-black">Save homepage</button>
    </form>
  );
}
