"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  async function load() {
    const params = new URLSearchParams({ q, status, paymentStatus });
    const data = await fetch(`/api/admin/orders?${params}`).then((r) => r.json());
    setOrders(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-5xl">Orders</h1>
        <a href="/api/admin/orders?export=csv" className="border border-[#c8b273] px-4 py-2 text-sm">
          Export CSV
        </a>
      </div>
      <form
        className="mb-6 grid gap-2 md:grid-cols-4"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, name, mobile" className="border border-[#2a2a2a] bg-black px-3 py-2" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-[#2a2a2a] bg-black px-3 py-2">
          <option value="">All statuses</option>
          {["PENDING_PAYMENT", "PAYMENT_PROCESSING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "PAYMENT_FAILED"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="border border-[#2a2a2a] bg-black px-3 py-2">
          <option value="">All payments</option>
          {["PENDING", "PROCESSING", "PAID", "FAILED", "CANCELLED"].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <button className="bg-[#c8b273] text-black">Filter</button>
      </form>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="block border border-[#2a2a2a] p-4">
            <p>{order.orderNumber}</p>
            <p className="text-sm text-[#b4b4ae]">
              {order.customerName} · {order.customerMobile} · {order.status} · {order.paymentStatus} · {formatInr(order.totalPaise)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
