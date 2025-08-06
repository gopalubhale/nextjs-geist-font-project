"use client";

import React, { useEffect, useState, useRef } from "react";

interface MediaItem {
  id: number;
  type: string;
  file_path: string;
}

export default function LinkPlaybackPage({ params }: { params: { code: string } }) {
  const { code } = params;
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const res = await fetch(`/api/link/${code}/content`);
        if (!res.ok) {
          console.error("Link not found or expired");
          return;
        }
        const data = await res.json();
        setMediaList(data.media);
      } catch (error) {
        console.error("Error fetching media content", error);
      }
    }
    fetchMedia();
  }, [code]);

  useEffect(() => {
    if (mediaList.length === 0) return;

    const currentMedia = mediaList[currentIndex];
    if (currentMedia.type === "video") {
      videoRef.current?.load();
      videoRef.current?.play();
    }

    // Auto advance to next media on video end
    const handleEnded = () => {
      setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    };

    const videoEl = videoRef.current;
    if (videoEl) {
      videoEl.addEventListener("ended", handleEnded);
    }

    return () => {
      if (videoEl) {
        videoEl.removeEventListener("ended", handleEnded);
      }
    };
  }, [currentIndex, mediaList]);

  useEffect(() => {
    // Auto fullscreen on page load
    const enterFullscreen = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen();
      }
    };
    enterFullscreen();
  }, []);

  if (mediaList.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Loading content or link expired.</p>
      </main>
    );
  }

  const currentMedia = mediaList[currentIndex];

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      {currentMedia.type === "image" && (
        <img
          src={`/uploads/${currentMedia.file_path}`}
          alt="Media content"
          className="max-w-full max-h-full object-contain"
        />
      )}
      {currentMedia.type === "video" && (
        <video
          ref={videoRef}
          controls={false}
          autoPlay
          muted
          className="max-w-full max-h-full object-contain"
          key={currentMedia.id}
        >
          <source src={`/uploads/${currentMedia.file_path}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {/* TODO: Add support for PPT and other media types */}
    </main>
  );
}
