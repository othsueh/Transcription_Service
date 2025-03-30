"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Player() {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const videoSource = localStorage.getItem("videoSource");
        if (!videoSource) {
          router.push("/");
          return;
        }

        const source = JSON.parse(videoSource);

        // Call our API endpoint to process the video
        const response = await fetch("/api/convert", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(source),
        });

        if (!response.ok) {
          throw new Error("Failed to convert video to audio");
        }

        const data = await response.json();
        setAudioUrl(data.audioUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    loadAudio();
  }, [router]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0b1e] p-8">
        <div className="relative">
          {/* Animated background rings */}
          <div className="absolute inset-0 -m-16">
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
            <div className="absolute inset-0 animate-pulse delay-75 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
            <div className="absolute inset-0 animate-pulse delay-150 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
          </div>

          {/* Loading content */}
          <div className="relative bg-[#12143a]/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50 text-center">
            <div className="flex flex-col items-center space-y-6">
              {/* Spinning circle animation */}
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-purple-500/20"></div>
                <div
                  className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"
                  style={{ animationDuration: "2s" }}
                ></div>
                <div className="absolute inset-4 rounded-full border-4 border-pink-500/20"></div>
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-t-pink-500 animate-spin"
                  style={{ animationDuration: "3s" }}
                ></div>
              </div>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Converting video to audio
              </h2>
              <p className="text-gray-400">
                Please wait while we process your file...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0b1e] p-8">
        <div className="bg-[#12143a]/50 backdrop-blur-xl rounded-3xl p-12 border border-red-500/50 text-center max-w-xl">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Conversion Failed
          </h2>
          <p className="text-gray-400 mb-8">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-6 rounded-xl font-medium 
                     hover:from-red-700 hover:to-pink-700 
                     transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-red-500/20"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0b1e] p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Audio Player
        </h1>

        <div className="bg-[#12143a]/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
          {audioUrl && (
            <div className="space-y-8">
              {/* Waveform-like decoration */}
              <div className="h-16 flex items-center justify-center gap-1 mb-8">
                {[...Array(50)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"
                    style={{
                      height: `${Math.sin(i * 0.2) * 50 + 60}%`,
                      animationDelay: `${i * 50}ms`,
                    }}
                  ></div>
                ))}
              </div>

              {/* Audio player */}
              <div className="relative">
                <audio
                  controls
                  className="w-full h-12 [&::-webkit-media-controls-panel]:bg-[#1a1c4b] [&::-webkit-media-controls-current-time-display]:text-white [&::-webkit-media-controls-time-remaining-display]:text-white"
                >
                  <source src={audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-8 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-medium 
                     hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0a0b1e]
                     transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
          >
            Convert Another Video
          </button>
        </div>
      </div>
    </main>
  );
}
