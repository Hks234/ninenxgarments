"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatInr } from "@/lib/money";

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch(`/api/admin/orders/${params.id}`).then((r) => r.json());
    setOrder(data);
    setNotes(data.internalNotes || "");
  }
  useEffect(() => {
    load();
  }, [params.id]);

  if (!order?.id) return <p>Loading order…</p>;

  async function update(status?: string) {
    setError("");
    const response = await fetch(`/api/admin/orders/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, internalNotes: notes }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl">{order.orderNumber}</h1>
      <p className="text-[#b4b4ae]">
        {order.customerName} · {order.customerMobile} · {order.status} · {order.paymentStatus}
      </p>
      <p>
        {order.houseNumber}, {order.street}, {order.city}, {order.state} {order.pinCode}
      </p>
      <p className="text-xl">{formatInr(order.totalPaise)}</p>
      <div className="space-y-3">
        {order.items.map((item: any) => (
          <div key={item.id} className="flex gap-3 border border-[#2a2a2a] p-3">
            {item.imageUrl && <img src={item.imageUrl} alt="" className="h-16 w-16 object-cover" />}
            <div>
              <p>{item.productName}</p>
              <p className="text-sm text-[#b4b4ae]">
                {item.sizeLabel} / {item.colourName} × {item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="h-24 w-full border border-[#2a2a2a] bg-black px-3 py-2" placeholder="Internal notes" />
      <div className="flex flex-wrap gap-2">
        {["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
          <button key={status} onClick={() => update(status)} className="border border-[#c8b273] px-3 py-1 text-sm">
            Mark {status}
          </button>
        ))}
        <button onClick={() => update()} className="bg-[#c8b273] px-4 py-1 text-black">
          Save notes
        </button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </div>
  );
}
