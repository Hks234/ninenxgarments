"use client";

import { useEffect, useState } from "react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/admin/reviews").then((r) => r.json());
    setReviews(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="mb-6 font-display text-5xl">Reviews</h1>
        <div className="space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="border border-[#2a2a2a] p-4">
              <p className="text-[#c8b273]">{"★".repeat(review.rating)}</p>
              <p className="mt-2">{review.body}</p>
              <p className="mt-3 text-sm">{review.displayName}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button
                  onClick={async () => {
                    const form = new FormData();
                    form.set("id", review.id);
                    form.set("isVisible", String(!review.isVisible));
                    await fetch("/api/admin/reviews", { method: "PATCH", body: form });
                    load();
                  }}
                >
                  {review.isVisible ? "Hide" : "Show"}
                </button>
                <button
                  onClick={async () => {
                    await fetch("/api/admin/reviews", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ id: review.id }),
                    });
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
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData();
          form.set("displayName", displayName);
          form.set("body", body);
          form.set("rating", String(rating));
          if (file) form.set("photo", file);
          const response = await fetch("/api/admin/reviews", { method: "POST", body: form });
          const data = await response.json();
          if (!response.ok) return setError(data.error);
          setDisplayName("");
          setBody("");
          load();
        }}
      >
        <h2 className="font-display text-3xl">Add review</h2>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Review text" className="h-28 w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full border border-[#2a2a2a] bg-black px-3 py-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <option key={value} value={value}>
              {value} stars
            </option>
          ))}
        </select>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="bg-[#c8b273] px-5 py-2 text-black">Save review</button>
      </form>
    </div>
  );
}
