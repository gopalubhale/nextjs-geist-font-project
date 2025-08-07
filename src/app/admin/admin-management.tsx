"use client";

import React, { useEffect, useState } from "react";

interface Customer {
  id: number;
  name: string;
  email: string;
  package_name: string;
  package_expiry: string;
}

export default function AdminManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/admin/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (!res.ok) {
        setError("Failed to fetch customers");
        return;
      }
      const data = await res.json();
      setCustomers(data.customers);
    } catch {
      setError("Error fetching customers");
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-4xl">
      <h2 className="text-xl font-semibold mb-4">Customer Management</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Customer ID</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Package</th>
            <th className="border border-gray-300 p-2">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust.id}>
              <td className="border border-gray-300 p-2">{cust.id}</td>
              <td className="border border-gray-300 p-2">{cust.name}</td>
              <td className="border border-gray-300 p-2">{cust.email}</td>
              <td className="border border-gray-300 p-2">{cust.package_name}</td>
              <td className="border border-gray-300 p-2">{cust.package_expiry}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
