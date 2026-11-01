"use client";

import { useEffect, useState } from "react";

type VideoRow = {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl: string | null;
  displayOrder: number;
  isActive: boolean;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await fetch("/api/admin/homepage/videos").then((r) => r.json());
    setVideos(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-[#c8b273]">Homepage</p>
        <h1 className="mt-2 font-display text-5xl">Portrait videos</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b4b4ae]">
          Upload 9:16 vertical videos for the storefront film reel. Use MP4, WebM, or MOV files under 40 MB. A poster
          image is optional and shows before playback.
        </p>
      </div>

      <form
        className="space-y-4 border border-[#2a2a2a] bg-[#0d0d0d] p-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setMessage("");
          setSaving(true);
          const form = new FormData(e.currentTarget);
          const response = await fetch("/api/admin/homepage/videos", { method: "POST", body: form });
          const data = await response.json();
          setSaving(false);
          if (!response.ok) return setError(data.error || "Could not upload video");
          e.currentTarget.reset();
          setMessage("Video added to the homepage reel.");
          load();
        }}
      >
        <h2 className="font-display text-3xl">Add video</h2>
        <label className="block text-sm text-[#b4b4ae]">
          Title
          <input name="title" className="mt-1 w-full border border-[#2a2a2a] bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-sm text-[#b4b4ae]">
          Caption
          <input name="caption" className="mt-1 w-full border border-[#2a2a2a] bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-sm text-[#b4b4ae]">
          Display order
          <input name="displayOrder" type="number" defaultValue={videos.length} className="mt-1 w-40 border border-[#2a2a2a] bg-black px-3 py-2 text-white" />
        </label>
        <label className="block text-sm text-[#b4b4ae]">
          9:16 video
          <input name="video" type="file" required accept="video/mp4,video/webm,video/quicktime" className="mt-1 block w-full text-sm" />
        </label>
        <label className="block text-sm text-[#b4b4ae]">
          Poster image (optional)
          <input name="poster" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="mt-1 block w-full text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isActive" value="true" defaultChecked /> Show on homepage
        </label>
        {error && <p className="text-sm text-red-300">{error}</p>}
        {message && <p className="text-sm text-[#c8b273]">{message}</p>}
        <button disabled={saving} className="bg-[#c8b273] px-6 py-3 text-black disabled:opacity-60">
          {saving ? "Uploading…" : "Upload video"}
        </button>
      </form>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <article key={video.id} className="border border-[#2a2a2a] bg-[#111] p-3">
            <video
              className="aspect-[9/16] w-full object-cover"
              src={video.videoUrl}
              poster={video.posterUrl || undefined}
              controls
              playsInline
              preload="metadata"
            />
            <p className="mt-3 font-display text-2xl">{video.title || "Untitled look"}</p>
            <p className="text-xs text-[#b4b4ae]">{video.isActive ? "Visible" : "Hidden"} · order {video.displayOrder}</p>
            <div className="mt-3 flex gap-2">
              <button
                className="border border-[#c8b273] px-3 py-1 text-xs"
                onClick={async () => {
                  const form = new FormData();
                  form.set("isActive", video.isActive ? "false" : "true");
                  await fetch(`/api/admin/homepage/videos/${video.id}`, { method: "PATCH", body: form });
                  load();
                }}
              >
                {video.isActive ? "Hide" : "Show"}
              </button>
              <button
                className="px-3 py-1 text-xs text-red-300"
                onClick={async () => {
                  if (!confirm("Delete this homepage video?")) return;
                  await fetch(`/api/admin/homepage/videos/${video.id}`, { method: "DELETE" });
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
  );
}
