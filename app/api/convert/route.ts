import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const { create: createYoutubeDl } = require('youtube-dl-exec')
const youtubedl = createYoutubeDl('/home/othsueh/miniconda3/bin/yt-dlp')

export async function POST(req: Request) {
  try {
    const { type, url, name } = await req.json();
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let audioPath;
    
    if (type === 'url') {
      try {
        // Generate a unique filename for the audio
        const timestamp = Date.now();
        const baseFilename = `youtube-${timestamp}`;
        audioPath = path.join(uploadsDir, `${baseFilename}.mp3`);

        // Use a specific output template to prevent duplicate files
        await youtubedl(url, {
          extractAudio: true,
          audioFormat: 'mp3',
          output: path.join(uploadsDir, `${baseFilename}.%(ext)s`),
          noCheckCertificates: true,
          noWarnings: true,
          preferFreeFormats: true,
        });

        // Clean up any temporary files that might have been created
        const files = fs.readdirSync(uploadsDir);
        files.forEach(file => {
          if (file.startsWith(baseFilename) && file !== `${baseFilename}.mp3`) {
            fs.unlinkSync(path.join(uploadsDir, file));
          }
        });

      } catch (ytError) {
        console.error('YouTube extraction error:', ytError);
        return NextResponse.json(
          { error: 'Failed to extract audio from YouTube video' },
          { status: 500 }
        );
      }
    }     
    else if (type === 'file') {
      // Handle local file
      const videoPath = path.join(uploadsDir, name);
      
      // Check if video file exists
      if (!fs.existsSync(videoPath)) {
        return NextResponse.json(
          { error: 'Video file not found' },
          { status: 404 }
        );
      }

      audioPath = path.join(uploadsDir, `${path.parse(name).name}.mp3`);

      try {
        // Convert video to audio using ffmpeg
        await execAsync(`ffmpeg -i "${videoPath}" -vn -acodec libmp3lame "${audioPath}"`);
        
        // Delete the original video file after conversion
        fs.unlinkSync(videoPath);
      } catch (ffmpegError) {
        console.error('FFmpeg conversion error:', ffmpegError);
        return NextResponse.json(
          { error: 'Failed to convert video to audio' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 });
    }

    // Return the URL for the converted audio file
    const audioUrl = `/uploads/${path.basename(audioPath)}`;
    return NextResponse.json({ audioUrl });
  } catch (error) {
    console.error('Error converting video:', error);
    return NextResponse.json(
      { error: 'Failed to convert video to audio' },
      { status: 500 }
    );
  }
}