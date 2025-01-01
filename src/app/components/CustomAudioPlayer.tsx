import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Play, Pause, Download, Loader2 } from "lucide-react";

interface CustomAudioPlayerProps {
  audioUrl: string;
  playlistTitle: string;
  playlistImageUrl: string;
  episodeTitle: string;
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  audioUrl,
  playlistTitle,
  playlistImageUrl,
  episodeTitle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${episodeTitle}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    const currentAudio = audioRef.current;

    if (currentAudio) {
      currentAudio.addEventListener("timeupdate", updateProgress);
      currentAudio.addEventListener("loadedmetadata", () => {
        setDuration(currentAudio.duration);
      });
    }

    return () => {
      if (currentAudio) {
        currentAudio.removeEventListener("timeupdate", updateProgress);
      }
    };
  }, []);

  const updateProgress = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        void audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center bg-gray-100 rounded-lg p-4 w-full">
      <audio ref={audioRef} src={audioUrl} className="hidden">
        <track kind="captions" />
      </audio>

      {/* Playlist image */}
      <div className="relative w-[5.2rem] h-[5.2rem] flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
        <Image
          src={playlistImageUrl}
          alt={playlistTitle}
          fill
          className="rounded-md object-cover"
        />
      </div>

      {/* Playlist and episode titles + controls */}
      <div className="flex-grow w-full sm:w-auto">
        {/* Titles */}
        <div className="flex flex-col mb-2 text-center sm:text-left">
          <span className="text-sm text-gray-600 break-words">
            {playlistTitle}
          </span>
          <span className="text-base font-medium break-words">
            {episodeTitle}
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-2">
            {/* Play/Pause button */}
            <button
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              aria-label={isPlaying ? "Pause" : "Lecture"}
              title={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              aria-label="Télécharger"
              title="Télécharger"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Slider with time */}
          <div className="flex-grow flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 w-10">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-grow h-1 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:appearance-none hover:[&::-webkit-slider-thumb]:bg-blue-600"
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                  (currentTime / duration) * 100
                }%, #E5E7EB ${(currentTime / duration) * 100}%, #E5E7EB 100%)`,
              }}
            />
            <span className="text-sm text-gray-500 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
