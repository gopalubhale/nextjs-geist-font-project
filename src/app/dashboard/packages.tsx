"use client";

import React, { useState, useEffect } from "react";

interface Package {
  id: number;
  name: string;
  price: number;
  duration_days: number;
  features: string;
}

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    try {
      const res = await fetch("/api/packages/list");
      if (!res.ok) {
        console.error("Failed to fetch packages");
        return;
      }
      const data = await res.json();
      setPackages(data.packages);
    } catch (error) {
      console.error("Error fetching packages", error);
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Available Packages</h2>
      {packages.length === 0 && <p>No packages available.</p>}
      <ul>
        {packages.map((pkg) => (
          <li key={pkg.id} className="mb-2">
            <strong>{pkg.name}</strong> - ₹{pkg.price} for {pkg.duration_days} days
            <br />
            Features: {pkg.features}
          </li>
        ))}
      </ul>
    </div>
  );
}
