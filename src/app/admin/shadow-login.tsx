"use client";

import React, { useState } from "react";

export default function ShadowLogin() {
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleShadowLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/shadow-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Shadow login failed");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Save token to localStorage or cookie
      localStorage.setItem("token", data.token);
      // Redirect to dashboard as shadow logged in user
      window.location.href = "/dashboard";
    } catch (err) {
      setError("An error occurred during shadow login");
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Shadow Login as Customer</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleShadowLogin} className="space-y-4">
        <input
          type="text"
          placeholder="Customer ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
          disabled={loading}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          {loading ? "Logging in..." : "Shadow Login"}
        </button>
      </form>
    </div>
  );
}
