"use client";

import { useEffect, useState } from "react";
import { ADDRESS_FIELDS } from "@/lib/address-fields";

const empty = { fullName: "", mobile: "", houseNumber: "", street: "", city: "", state: "", pinCode: "", landmark: "" };

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  async function load() {
    const data = await fetch("/api/account").then((r) => r.json());
    setAddresses(data.addresses || []);
  }
  useEffect(() => { load(); }, []);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <h1 className="mb-6 font-display text-4xl">Saved addresses</h1>
        <div className="space-y-4">
          {addresses.map((address) => (
            <article key={address.id} className="border border-[#2a2a2a] p-4">
              <p>{address.fullName}</p>
              <p className="text-sm text-[#b4b4ae]">{address.houseNumber}, {address.street}, {address.city}, {address.state} {address.pinCode}</p>
              <button
                className="mt-3 text-sm text-red-300"
                onClick={async () => {
                  await fetch("/api/account/addresses", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: address.id }) });
                  load();
                }}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </div>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
          const data = await response.json();
          if (!response.ok) return setError(data.error);
          setForm(empty);
          load();
        }}
      >
        <h2 className="font-display text-3xl">Add address</h2>
        {ADDRESS_FIELDS.map((field) => (
          <input
            key={field.key}
            placeholder={field.label}
            aria-label={field.label}
            value={(form as any)[field.key]}
            onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
            className="w-full border border-[#2a2a2a] bg-black px-3 py-2"
          />
        ))}
        {error && <p className="text-sm text-red-300">{error}</p>}
        <button className="bg-[#c8b273] px-5 py-2 text-black">Save address</button>
      </form>
    </div>
  );
}
