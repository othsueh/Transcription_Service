import { NextResponse } from 'next/server';
import { GladiaService } from '@/app/services/gladia';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { audioUrl } = await request.json();

        if (!audioUrl) {
            return NextResponse.json(
                { error: 'Audio URL is required' },
                { status: 400 }
            );
        }

        // Get the absolute path of the audio file
        const audioPath = path.join(process.cwd(), 'public', audioUrl);
        
        // Check if file exists
        if (!fs.existsSync(audioPath)) {
            return NextResponse.json(
                { error: 'Audio file not found' },
                { status: 404 }
            );
        }

        // Create a Blob from the file
        const audioBuffer = fs.readFileSync(audioPath);
        const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });

        // Step 1: Upload the audio file to Gladia
        const gladiaAudioUrl = await GladiaService.uploadAudio(audioBlob);

        // Step 2: Start transcription
        const resultUrl = await GladiaService.startTranscription(gladiaAudioUrl);

        // Step 3: Poll for results
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds timeout

        while (attempts < maxAttempts) {
            try {
                const transcription = await GladiaService.getTranscriptionResult(resultUrl);
                return NextResponse.json({ transcription });
            } catch (error) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            }
        }

        throw new Error('Transcription timeout');
    } catch (error) {
        console.error('Transcription error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred during transcription' },
            { status: 500 }
        );
    }
}