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
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`
      : `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center bg-gray-100 rounded-lg px-4 py-[14px] w-full">
      <audio ref={audioRef} src={audioUrl} className="hidden">
        <track kind="captions" />
      </audio>

      {/* Playlist image */}
      <div className="relative w-[5.5rem] h-[5.5rem] flex-shrink-0 mb-4 sm:mb-0 sm:mr-4">
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
              className="w-9 h-9 flex items-center justify-center bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              aria-label={isPlaying ? "Pause" : "Lecture"}
              title={isPlaying ? "Pause" : "Lecture"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5" />
              )}
            </button>

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-9 h-9 flex items-center justify-center bg-blue-500 rounded-full text-white hover:bg-blue-600 transition-colors"
              aria-label="Télécharger"
              title="Télécharger"
            >
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Slider with time */}
          <div className="flex-grow flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-sm text-gray-500 w-auto">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleTimeChange}
              className="flex-grow h-2 bg-gray-300 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-blue-500
              [&::-webkit-slider-thumb]:appearance-none
              hover:[&::-webkit-slider-thumb]:bg-blue-600
          
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-blue-500
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:border-none
              hover:[&::-moz-range-thumb]:bg-blue-600
          
              [&::-ms-thumb]:w-5
              [&::-ms-thumb]:h-5
              [&::-ms-thumb]:rounded-full
              [&::-ms-thumb]:bg-blue-500
              [&::-ms-thumb]:appearance-none
              [&::-ms-thumb]:border-none
            hover:[&::-ms-thumb]:bg-blue-600
            "
              style={{
                background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${
                  (currentTime / duration) * 100
                }%, #D1D5DB ${(currentTime / duration) * 100}%, #D1D5DB 100%)`,
              }}
            />
            <span className="text-sm text-gray-500 w-auto">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
