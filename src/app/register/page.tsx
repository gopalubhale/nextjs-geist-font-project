"use client";

import React, { useState } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Registration successful, redirect to login
      window.location.href = "/login";
    } catch (err) {
      setError("An error occurred during registration");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      <h1 className="text-3xl font-bold mb-6">Register for G Network Services</h1>
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md space-y-4 bg-gray-50 p-6 rounded shadow"
      >
        {error && (
          <div className="text-red-600 font-semibold text-center">{error}</div>
        )}
        <div>
          <label htmlFor="name" className="block mb-1 font-semibold">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-semibold">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-semibold">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}
