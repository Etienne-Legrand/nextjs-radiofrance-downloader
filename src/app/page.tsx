"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Podcast } from "@/app/types/podcast";
import CustomAudioPlayer from "./components/CustomAudioPlayer";

async function fetchPodcast(url: string): Promise<Podcast> {
  const response = await fetch(`/api/podcast?url=${encodeURIComponent(url)}`);
  if (!response.ok) {
    throw new Error("Le podcast est introuvable.");
  }
  return response.json();
}

export default function PodcastPage() {
  const [url, setUrl] = useState<string>("");

  const {
    data: podcast,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Podcast, Error>({
    queryKey: ["podcast", url],
    queryFn: () => fetchPodcast(url),
    enabled: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-cyan-50">
      <div className="max-w-2xl mx-auto p-4">
        <form onSubmit={handleSubmit} className="mb-4">
          <h1 className="text-3xl font-bold mb-8 mt-4 text-center">
            Podcast Radio France
          </h1>
          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL du podcast Radio France"
              className="flex-1 p-2 border-2 border-gray-500 rounded"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : "Rechercher"}
            </button>
          </div>
        </form>

        {isError && (
          <div className="text-red-500 text-center">{error.message}</div>
        )}

        {podcast && (
          <div className="space-y-4">
            {/* <h1 className="text-2xl font-bold text-center">{podcast.title}</h1> */}
            <div className="relative w-full h-64">
              <Image
                src={podcast.imageUrl}
                alt={podcast.title}
                fill
                className="rounded-lg object-cover"
                priority
              />
            </div>
            <div className="flex flex-col items-center space-y-4">
              <CustomAudioPlayer
                audioUrl={podcast.audioUrl}
                playlistTitle={podcast.playlistTitle}
                playlistImageUrl={podcast.playlistImageUrl}
                episodeTitle={podcast.title}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
