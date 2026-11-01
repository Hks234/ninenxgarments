"use client";

import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [q, setQ] = useState("");

  async function load(search = q) {
    const data = await fetch(`/api/admin/customers?q=${encodeURIComponent(search)}`).then((r) => r.json());
    setCustomers(Array.isArray(data) ? data : []);
  }
  useEffect(() => {
    load("");
  }, []);

  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">Customers</h1>
      <form
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load();
        }}
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or mobile" className="w-full max-w-sm border border-[#2a2a2a] bg-black px-3 py-2" />
        <button className="border border-[#c8b273] px-4">Search</button>
      </form>
      <div className="space-y-3">
        {customers.map((customer) => (
          <article key={customer.id} className="border border-[#2a2a2a] p-4">
            <p>{customer.name || "Unnamed"} · {customer.mobile}</p>
            <p className="text-sm text-[#b4b4ae]">
              {customer.orders.length} orders · paid {formatInr(customer.orderTotalPaise)} · {customer.isActive ? "Active" : "Disabled"}
            </p>
            <button
              className="mt-3 text-sm text-[#c8b273]"
              onClick={async () => {
                await fetch("/api/admin/customers", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: customer.id, isActive: !customer.isActive }),
                });
                load();
              }}
            >
              {customer.isActive ? "Disable login" : "Enable login"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
