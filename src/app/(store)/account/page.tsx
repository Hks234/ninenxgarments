"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function AccountPage() {
  const [data, setData] = useState<any>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/account").then((r) => r.json()).then((d) => {
      setData(d);
      setName(d.customer?.name || "");
    });
  }, []);

  if (!data) return <p>Loading account…</p>;
  if (!data.customer) {
    return (
      <div>
        <h1 className="font-display text-5xl">My Account</h1>
        <p className="mt-4 text-[#b4b4ae]">Login is required to view your account, addresses, and orders.</p>
        <Link href="/login?next=/account" className="mt-4 inline-block bg-[#c8b273] px-6 py-2 text-black">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <h1 className="font-display text-5xl">My Account</h1>
      <form
        className="max-w-md space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await fetch("/api/account", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
        }}
      >
        <p className="text-sm text-[#b4b4ae]">Mobile: {data.customer.mobile}</p>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-[#2a2a2a] bg-black px-3 py-2" placeholder="Your name" />
        <button className="bg-[#c8b273] px-5 py-2 text-black">Save name</button>
      </form>
      <div className="flex gap-4">
        <Link href="/account/addresses" className="border border-[#2a2a2a] px-4 py-2">Addresses</Link>
        <Link href="/orders" className="border border-[#2a2a2a] px-4 py-2">My Orders</Link>
        <button
          onClick={async () => {
            await fetch("/api/auth/customer/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="px-4 py-2 text-[#c8b273]"
        >
          Logout
        </button>
      </div>
      <div>
        <h2 className="mb-4 font-display text-3xl">Recent orders</h2>
        <div className="space-y-3">
          {data.orders.map((order: any) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block border border-[#2a2a2a] p-4">
              <p>{order.orderNumber}</p>
              <p className="text-sm text-[#b4b4ae]">{order.status} · {order.paymentStatus} · {formatInr(order.totalPaise)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
