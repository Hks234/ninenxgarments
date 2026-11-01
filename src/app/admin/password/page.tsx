"use client";

import { useState } from "react";

export default function AdminPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      className="max-w-md space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        const response = await fetch("/api/auth/admin/password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await response.json();
        if (!response.ok) return setError(data.error);
        setMessage("Password updated.");
        setCurrentPassword("");
        setNewPassword("");
      }}
    >
      <h1 className="font-display text-5xl">Change password</h1>
      <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Current password" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password (10+ characters)" className="w-full border border-[#2a2a2a] bg-black px-3 py-2" />
      {error && <p className="text-sm text-red-300">{error}</p>}
      {message && <p className="text-sm text-[#c8b273]">{message}</p>}
      <button className="bg-[#c8b273] px-5 py-2 text-black">Update password</button>
    </form>
  );
}
