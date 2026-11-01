"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatInr } from "@/lib/money";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);

  async function load() {
    const data = await fetch("/api/cart").then((r) => r.json());
    setCart(data);
  }
  useEffect(() => { load(); }, []);

  if (!cart) return <p>Loading cart…</p>;
  if (!cart.loggedIn) {
    return (
      <div>
        <h1 className="font-display text-5xl">Cart</h1>
        <p className="mt-4 text-[#b4b4ae]">Login with your mobile number to view your cart and continue to checkout.</p>
        <Link href="/login?next=/cart" className="mt-4 inline-block bg-[#c8b273] px-6 py-2 text-black">Login</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 font-display text-5xl">Shopping Cart</h1>
      {cart.items.length === 0 ? (
        <p>Your cart is empty. <Link href="/shop" className="text-[#c8b273]">Shop now</Link></p>
      ) : (
        <div className="space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="grid items-center gap-4 border border-[#2a2a2a] p-4 md:grid-cols-[100px_1fr_auto]">
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="h-24 w-24 object-cover" />}
              <div>
                <p className="font-display text-2xl">{item.name}</p>
                <p className="text-sm text-[#b4b4ae]">{item.size} / {item.colour}</p>
                <p>{formatInr(item.unitPricePaise)}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={async (e) => {
                    await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id, quantity: Number(e.target.value) }) });
                    load();
                    window.dispatchEvent(new Event("cart-updated"));
                  }}
                  className="w-16 border border-[#2a2a2a] bg-black px-2 py-1"
                />
                <p>{formatInr(item.lineTotalPaise)}</p>
                <button
                  onClick={async () => {
                    await fetch("/api/cart", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: item.id }) });
                    load();
                    window.dispatchEvent(new Event("cart-updated"));
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-[#2a2a2a] pt-6">
            <p className="text-xl">Total {formatInr(cart.totalPaise)}</p>
            <Link href="/checkout" className="bg-[#c8b273] px-8 py-3 text-black">Proceed to checkout</Link>
          </div>
        </div>
      )}
    </div>
  );
}
