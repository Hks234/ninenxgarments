"use client";

import { useEffect, useState } from "react";

export default function AdminPaymentsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/payments").then((r) => r.json()).then(setData);
  }, []);
  if (!data) return <p>Loading payment status…</p>;
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="font-display text-5xl">Payments</h1>
      <p>Razorpay configured: {data.configured ? "Yes" : "No"}</p>
      <p>Key preview: {data.keyIdPreview || "Not set"}</p>
      <p>Webhook configured: {data.webhookConfigured ? "Yes" : "No"}</p>
      <p className="text-[#b4b4ae]">{data.message}</p>
    </div>
  );
}
