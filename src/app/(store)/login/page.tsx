"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function sendOtp() {
    setError("");
    const response = await fetch("/api/auth/customer/otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    setChallengeId(data.challengeId);
    setDevOtp(data.developmentOtp || "");
    setNotice(data.notice);
  }

  async function verify() {
    setError("");
    const response = await fetch("/api/auth/customer/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mobile, challengeId, otp }),
    });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    window.location.href = next;
  }

  return (
    <div className="mx-auto max-w-md border border-[#2a2a2a] bg-[#111] p-8">
      <h1 className="font-display text-4xl">Login</h1>
      <p className="mt-3 text-sm text-[#b4b4ae]">Enter your mobile number. An on-screen OTP is used in development mode and does not prove phone ownership.</p>
      <label className="mt-6 block text-sm">Mobile number</label>
      <input value={mobile} onChange={(e) => setMobile(e.target.value)} className="mt-2 w-full border border-[#2a2a2a] bg-black px-3 py-2" placeholder="10-digit Indian mobile" />
      <button onClick={sendOtp} className="mt-4 w-full border border-[#c8b273] py-2">GET OTP</button>
      {devOtp && (
        <p className="mt-4 border border-[#c8b273]/40 bg-black p-3 text-sm">
          Development OTP: <strong>{devOtp}</strong>
        </p>
      )}
      {notice && <p className="mt-3 text-xs text-[#b4b4ae]">{notice}</p>}
      {challengeId && (
        <>
          <label className="mt-6 block text-sm">OTP</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-2 w-full border border-[#2a2a2a] bg-black px-3 py-2" />
          <button onClick={verify} className="mt-4 w-full bg-[#c8b273] py-2 text-black">Verify and continue</button>
        </>
      )}
      {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
