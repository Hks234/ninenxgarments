"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/account").then((r) => r.json()).then((d) => setOrders(d.orders || []));
  }, []);
  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="block border border-[#2a2a2a] p-5">
            <p className="font-display text-2xl">{order.orderNumber}</p>
            <p className="text-sm text-[#b4b4ae]">{new Date(order.createdAt).toLocaleString("en-IN")} · {order.status} · {order.paymentStatus} · {formatInr(order.totalPaise)}</p>
          </Link>
        ))}
        {orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </div>
  );
}
