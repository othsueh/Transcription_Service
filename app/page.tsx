'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (videoUrl) {
        localStorage.setItem('videoSource', JSON.stringify({ type: 'url', url: videoUrl }));
        // Add a small delay to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/player');
      } else if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'file');
        formData.append('name', file.name);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        const { filename } = await uploadResponse.json();
        localStorage.setItem('videoSource', JSON.stringify({ type: 'file', name: filename }));
        // Add a small delay to ensure localStorage is updated
        await new Promise(resolve => setTimeout(resolve, 100));
        router.push('/player');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process the video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setVideoUrl('');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0b1e] p-8">
      <div className="w-full max-w-7xl">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Video to Audio Converter
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="bg-[#12143a]/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-semibold mb-4 text-white">How do you want to transcribe?</h2>
            <p className="text-gray-400 text-sm mb-8">
              Test the API using a link to any video site - Youtube, Tiktok, Facebook, upload your own file or stream audio from your microphone.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Link Input */}
              <div className="bg-[#1a1c4b] rounded-2xl p-6 border-2 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group">
                <label className="flex flex-col h-full">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-white">Paste video link</h3>
                  </div>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v="
                    className="w-full p-3 bg-[#12143a]/50 rounded-xl border border-gray-700/50 focus:border-blue-500/50 focus:outline-none text-white placeholder-gray-500 transition-all duration-300"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setFile(null);
                    }}
                  />
                </label>
              </div>

              {/* File Upload */}
              <div 
                className="bg-[#1a1c4b] rounded-2xl p-6 border-2 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 group"
              >
                <label className="flex flex-col h-full cursor-pointer">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-white">Upload a file</h3>
                  </div>
                  <div className="flex-grow flex items-center justify-center bg-[#12143a]/50 rounded-xl border border-gray-700/50 group-hover:border-purple-500/50 p-8 transition-all duration-300">
                    <p className="text-gray-400 text-center">
                      {file ? file.name : "Click to browse, or drop your file"}
                    </p>
                    <input
                      id="fileInput"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={(!videoUrl && !file) || isLoading}
            className="mt-8 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-medium 
                     hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-[#0a0b1e]
                     disabled:opacity-50 disabled:cursor-not-allowed 
                     transition-all duration-300 ease-out transform hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : 'Next'}
          </button>
        </form>
      </div>
    </main>
  );
}