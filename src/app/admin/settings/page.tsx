"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setSettings(await fetch("/api/admin/settings").then((r) => r.json()));
  }
  useEffect(() => {
    load();
  }, []);

  if (!settings) return <p>Loading settings…</p>;

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-5xl">Store settings</h1>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const response = await fetch("/api/admin/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              businessName: form.get("businessName"),
              businessPhone: form.get("businessPhone"),
              businessAddress: form.get("businessAddress"),
              instagramUrl: form.get("instagramUrl"),
              footerText: form.get("footerText"),
              lowStockThreshold: Number(form.get("lowStockThreshold")),
              otpDisplayEnabled: form.get("otpDisplayEnabled") === "on",
            }),
          });
          const data = await response.json();
          if (!response.ok) return setError(data.error);
          setMessage("Settings saved.");
        }}
      >
        <input name="businessName" defaultValue={settings.businessName} className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <input name="businessPhone" defaultValue={settings.businessPhone} className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <textarea name="businessAddress" defaultValue={settings.businessAddress} className="h-24 w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <input name="instagramUrl" defaultValue={settings.instagramUrl} className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <textarea name="footerText" defaultValue={settings.footerText || ""} className="h-20 w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <input name="lowStockThreshold" type="number" defaultValue={settings.lowStockThreshold} className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="otpDisplayEnabled" defaultChecked={settings.otpDisplayEnabled} /> Show development OTP
        </label>
        <button className="bg-[#c8b273] px-5 py-2 text-black">Save settings</button>
      </form>
      <form
        className="space-y-3 border border-[#2a2a2a] p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const response = await fetch("/api/admin/logo", { method: "POST", body: form });
          const data = await response.json();
          if (!response.ok) return setError(data.error);
          setMessage("Logo updated.");
          load();
        }}
      >
        <h2 className="font-display text-3xl">Logo</h2>
        {settings.logoUrl && <img src={settings.logoUrl} alt="Logo" className="h-16" />}
        <input type="file" name="logo" accept="image/jpeg,image/png,image/webp,image/avif" />
        <button className="border border-[#c8b273] px-4 py-2">Upload logo</button>
      </form>
      {error && <p className="text-sm text-red-300">{error}</p>}
      {message && <p className="text-sm text-[#c8b273]">{message}</p>}
    </div>
  );
}
