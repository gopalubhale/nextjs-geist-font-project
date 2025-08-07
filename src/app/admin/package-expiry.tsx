"use client";

import React, { useEffect, useState } from "react";

interface Subscription {
  id: number;
  user_id: number;
  package_name: string;
  expires_at: string;
  status: string;
}

export default function PackageExpiry() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  async function fetchSubscriptions() {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        setError("Failed to fetch subscriptions");
        return;
      }
      const data = await res.json();
      setSubscriptions(data.subscriptions);
    } catch (error) {
      setError("Error fetching subscriptions");
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-3xl">
      <h2 className="text-xl font-semibold mb-4">Package Expiry Management</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Subscription ID</th>
            <th className="border border-gray-300 p-2">User ID</th>
            <th className="border border-gray-300 p-2">Package Name</th>
            <th className="border border-gray-300 p-2">Expires At</th>
            <th className="border border-gray-300 p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td className="border border-gray-300 p-2">{sub.id}</td>
              <td className="border border-gray-300 p-2">{sub.user_id}</td>
              <td className="border border-gray-300 p-2">{sub.package_name}</td>
              <td className="border border-gray-300 p-2">{sub.expires_at}</td>
              <td className="border border-gray-300 p-2">{sub.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
