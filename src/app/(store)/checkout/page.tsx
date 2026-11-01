"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { formatInr } from "@/lib/money";
import { ADDRESS_FIELDS } from "@/lib/address-fields";

export default function CheckoutPage() {
  const [cart, setCart] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    houseNumber: "",
    street: "",
    city: "",
    state: "",
    pinCode: "",
    landmark: "",
    saveAddress: true,
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetch("/api/cart").then((r) => r.json()).then(setCart);
    fetch("/api/account").then((r) => r.json()).then((data) => {
      setAccount(data);
      setForm((current) => ({
        ...current,
        fullName: data.customer?.name || "",
        mobile: data.customer?.mobile || "",
      }));
    });
  }, []);

  async function pay() {
    if (paying) return;
    setPaying(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setPaying(false);
      return setError(data.error);
    }
    if (!data.configured) {
      setPaying(false);
      setMessage(data.message);
      return;
    }
    const options = {
      key: data.keyId,
      amount: data.amountPaise,
      currency: "INR",
      name: "NINE XN GARMENTS",
      order_id: data.razorpayOrderId,
      prefill: { name: data.customerName, contact: data.customerMobile },
      handler: async (response: any) => {
        const verify = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId, ...response }),
        });
        const result = await verify.json();
        window.location.href = verify.ok
          ? `/payment/result?status=success&order=${result.orderNumber}`
          : `/payment/result?status=failed`;
      },
      modal: {
        ondismiss: () => {
          window.location.href = `/payment/result?status=cancelled`;
        },
      },
    };
    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  }

  if (!cart) return <p>Loading checkout…</p>;
  if (!cart.loggedIn) {
    return (
      <div>
        <h1 className="font-display text-5xl">Checkout</h1>
        <p className="mt-4">Login is required before checkout.</p>
        <a href="/login?next=/checkout" className="mt-4 inline-block bg-[#c8b273] px-6 py-2 text-black">
          Login
        </a>
      </div>
    );
  }
  if (!cart.items?.length) {
    return (
      <div>
        <h1 className="font-display text-5xl">Checkout</h1>
        <p className="mt-4 text-[#b4b4ae]">Your cart is empty.</p>
        <a href="/shop" className="mt-6 inline-block bg-[#c8b273] px-6 py-2 text-black">
          Continue shopping
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div>
        <h1 className="mb-6 font-display text-5xl">Checkout</h1>
        <p className="mb-4 text-sm text-[#b4b4ae]">Online payment through Razorpay is the only available method. Cash on Delivery is not offered.</p>
        {account?.addresses?.length > 0 && (
          <div className="mb-6 space-y-2">
            {account.addresses.map((address: any) => (
              <button
                key={address.id}
                className="block w-full border border-[#2a2a2a] p-3 text-left"
                onClick={() => setForm({ ...form, ...address, saveAddress: false })}
              >
                {address.fullName}, {address.houseNumber}, {address.street}, {address.city}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-3">
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.saveAddress} onChange={(e) => setForm({ ...form, saveAddress: e.target.checked })} />
            Save this address
          </label>
        </div>
      </div>
      <div className="border border-[#2a2a2a] bg-[#111] p-6">
        <h2 className="font-display text-3xl">Order summary</h2>
        <div className="mt-4 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="flex gap-3">
              {item.imageUrl && <img src={item.imageUrl} alt="" className="h-16 w-16 object-cover" />}
              <div className="flex-1 text-sm">
                <p>{item.name}</p>
                <p className="text-[#b4b4ae]">{item.size} / {item.colour} × {item.quantity}</p>
              </div>
              <p>{formatInr(item.lineTotalPaise)}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xl">Grand total {formatInr(cart.totalPaise)}</p>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        {message && <p className="mt-4 text-sm text-[#c8b273]">{message}</p>}
        <button onClick={pay} disabled={paying} className="mt-6 w-full bg-[#c8b273] py-3 text-black disabled:opacity-60">
          {paying ? "Opening payment…" : "Pay with Razorpay"}
        </button>
      </div>
    </div>
  );
}
