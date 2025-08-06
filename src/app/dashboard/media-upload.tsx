"use client";

import React, { useState } from "react";

export default function MediaUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  }

  async function handleUpload() {
    if (files.length === 0) {
      setError("Please select files to upload.");
      return;
    }
    setError(null);
    setUploading(true);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setFiles([]);
      setUploading(false);
      alert("Files uploaded successfully.");
    } catch (err) {
      setError("An error occurred during upload.");
      setUploading(false);
    }
  }

  return (
    <div className="p-4 bg-gray-50 rounded shadow max-w-md">
      <h2 className="text-xl font-semibold mb-4">Upload Media</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
