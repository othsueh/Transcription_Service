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

interface TranscriptionResult {
    metadata: {
        audio_duration: number;
        number_of_distinct_channels: number;
        billing_time: number;
        transcription_time: number;
    };
    transcription: {
        utterances: Utterance[];
        full_transcript: string;
        languages: string[];
    };
}
export class GladiaService {
    private static readonly API_KEY = process.env.NEXT_PUBLIC_GLADIA_API_KEY;
    private static readonly BASE_URL = 'https://api.gladia.io/v2';

    static async uploadAudio(audioBlob: Blob): Promise<string> {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.mp3');

        const response = await fetch(`${this.BASE_URL}/upload`, {
            method: 'POST',
            headers: {
                'x-gladia-key': this.API_KEY || '',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Failed to upload audio file');
        }

        const data = await response.json();
        return data.audio_url;
    }

    static async startTranscription(audioUrl: string): Promise<string> {
        const response = await fetch(`${this.BASE_URL}/pre-recorded`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-gladia-key': this.API_KEY || '',
            },
            body: JSON.stringify({
                audio_url: audioUrl,
                diarization: true,
                diarization_config: {
                    number_of_speakers: 2,
                    min_speakers: 1,
                    max_speakers: 5,
                },
                detect_language: true,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to start transcription');
        }

        const data = await response.json();
        return data.result_url;
    }

    static async getTranscriptionResult(resultUrl: string): Promise<TranscriptionResult> {
        const headers = {
            'x-gladia-key': this.API_KEY || '',
        };

        const response = await fetch(resultUrl, { headers });
        if (!response.ok) {
            throw new Error('Failed to get transcription result');
        }

        const data = await response.json();

        if (data.status === 'done') {
            return data.result;
        } else {
            throw new Error(`Transcription status: ${data.status}`);
        }
    }
}