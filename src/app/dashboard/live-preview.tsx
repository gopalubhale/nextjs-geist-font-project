"use client";

import React, { useEffect, useState } from "react";

interface MediaItem {
  id: number;
  type: string;
  file_path: string;
}

export default function LivePreview({ userId }: { userId: number }) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:4000");

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "joinUserRoom", userId }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "mediaUpdated") {
        fetchMedia();
      }
    };

    async function fetchMedia() {
      try {
        const res = await fetch("/api/media/list", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!res.ok) {
          console.error("Failed to fetch media list");
          return;
        }
        const json = await res.json();
        setMediaList(json.media);
      } catch (error) {
        console.error("Error fetching media list", error);
      }
    }

    fetchMedia();

    return () => {
      socket.close();
    };
  }, [userId]);

  return (
    <div className="p-4 bg-gray-100 rounded shadow max-h-96 overflow-auto">
      <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
      {mediaList.length === 0 && <p>No media uploaded yet.</p>}
      <ul>
        {mediaList.map((media) => (
          <li key={media.id} className="mb-2">
            {media.type.toUpperCase()}: {media.file_path}
          </li>
        ))}
      </ul>
    </div>
  );
}
