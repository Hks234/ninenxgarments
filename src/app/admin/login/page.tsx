"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/auth/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Login failed");
    window.location.href = next;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] px-4">
      <form onSubmit={submit} className="w-full max-w-md border border-[#2a2a2a] bg-[#111] p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nine-xn-logo.jpg" alt="NINE XN GARMENTS" className="mx-auto mb-5 h-20 w-20 rounded-full object-cover" />
        <p className="text-center text-xs uppercase tracking-[0.35em] text-[#c8b273]">NINE XN GARMENTS</p>
        <h1 className="mt-3 font-display text-4xl">Admin login</h1>
        <label className="mt-8 block text-sm">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-2 w-full border border-[#2a2a2a] bg-black px-3 py-2" autoComplete="username" />
        <label className="mt-4 block text-sm">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full border border-[#2a2a2a] bg-black px-3 py-2" autoComplete="current-password" />
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <button className="mt-6 w-full bg-[#c8b273] py-3 text-black">Sign in</button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
