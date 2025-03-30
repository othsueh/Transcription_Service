'use client';

import { useEffect, useState, useRef } from 'react';

interface Word {
    word: string;
    start: number;
    end: number;
    confidence: number;
}

interface Utterance {
    words: Word[];
    text: string;
    language: string;
    start: number;
    end: number;
    confidence: number;
    speaker: number;
    channel: number;
}

interface TranscriptionDisplayProps {
    utterances: Utterance[];
    currentTime: number;
    onSeek: (time: number) => void;
}

export default function TranscriptionDisplay({ utterances, currentTime, onSeek }: TranscriptionDisplayProps) {
    const [activeUtteranceIndex, setActiveUtteranceIndex] = useState<number>(-1);
    const transcriptionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const newActiveIndex = utterances.findIndex(
            (utterance) => currentTime >= utterance.start && currentTime <= utterance.end
        );
        
        if (newActiveIndex !== activeUtteranceIndex) {
            setActiveUtteranceIndex(newActiveIndex);
            
            if (newActiveIndex !== -1 && transcriptionRef.current) {
                const utteranceElements = transcriptionRef.current.children;
                if (utteranceElements[newActiveIndex]) {
                    utteranceElements[newActiveIndex].scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        }
    }, [currentTime, utterances, activeUtteranceIndex]);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent sticky top-0 bg-[#12143a] p-4 border-b border-gray-700/50 z-10">
                Live Transcription
            </h2>
            <div className="flex-1 overflow-y-auto" ref={transcriptionRef}>
                {utterances.map((utterance, index) => (
                    <div
                        key={index}
                        onClick={() => onSeek(utterance.start)}
                        className={`px-4 py-3 transition-all duration-300 border-b border-gray-700/30 cursor-pointer ${
                            index === activeUtteranceIndex
                                ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20'
                                : 'hover:bg-white/5'
                        }`}
                    >
                        <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                            <span>
                                {formatTime(utterance.start)} - {formatTime(utterance.end)}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                                utterance.speaker === 0 ? 'bg-blue-500/20 text-blue-300' : 'bg-pink-500/20 text-pink-300'
                            }`}>
                                Speaker {utterance.speaker + 1}
                            </span>
                        </div>
                        <p className={`text-base leading-relaxed ${
                            index === activeUtteranceIndex 
                                ? 'text-white font-medium' 
                                : 'text-gray-300'
                        }`}>
                            {utterance.text}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
} 