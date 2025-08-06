"use client";

import React, { useState, useEffect } from "react";

interface Group {
  id: number;
  name: string;
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/groups/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setError("Failed to fetch groups");
        return;
      }
      const data = await res.json();
      setGroups(data.groups);
    } catch (error) {
      setError("Error fetching groups");
    }
  }

  async function handleAddGroup() {
    if (!newGroupName.trim()) {
      setError("Group name cannot be empty");
      return;
    }
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create group");
        return;
      }
      setNewGroupName("");
      fetchGroups();
    } catch (error) {
      setError("Error creating group");
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Content Groups</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="flex mb-4 gap-2">
        <input
          type="text"
          placeholder="New group name"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="flex-grow border border-gray-300 rounded px-3 py-2"
        />
        <button
          onClick={handleAddGroup}
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Add
        </button>
      </div>
      <ul>
        {groups.map((group) => (
          <li key={group.id} className="mb-2">
            {group.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
