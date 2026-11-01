"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "Could not load dashboard");
        setData(json);
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-300">{error}</p>;
  if (!data) return <p>Loading dashboard…</p>;

  const cards = [
    ["Products", data.totalProducts],
    ["Active products", data.activeProducts],
    ["Categories", data.totalCategories],
    ["Customers", data.totalCustomers],
    ["Orders", data.totalOrders],
    ["Pending orders", data.pendingOrders],
    ["Paid orders", data.paidOrders],
    ["Failed payments", data.failedPayments],
    ["Paid total", formatInr(data.totalPaidPaise)],
  ];

  return (
    <div className="space-y-10">
      <h1 className="font-display text-5xl">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="border border-[#2a2a2a] bg-[#111] p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#c8b273]">{label}</p>
            <p className="mt-3 font-display text-3xl">{value}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-4 font-display text-3xl">Low stock</h2>
        {data.lowStock.length === 0 ? (
          <p className="text-[#b4b4ae]">No variants are at or below the low-stock threshold.</p>
        ) : (
          <div className="space-y-2">
            {data.lowStock.map((row: any) => (
              <p key={row.id} className="border border-[#2a2a2a] p-3 text-sm">
                {row.product.name} · {row.size.label} / {row.colour.name} · {row.stock} left
              </p>
            ))}
          </div>
        )}
      </section>
      <section>
        <h2 className="mb-4 font-display text-3xl">Recent orders</h2>
        <div className="space-y-2">
          {data.recentOrders.map((order: any) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="block border border-[#2a2a2a] p-4">
              <p>{order.orderNumber}</p>
              <p className="text-sm text-[#b4b4ae]">
                {order.customerName} · {order.status} · {order.paymentStatus} · {formatInr(order.totalPaise)}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
