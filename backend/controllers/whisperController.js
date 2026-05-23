import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const transcribeAudio = async (req, res, next) => {
  try {
    const { language = 'en' } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const audioPath = req.file.path;
    const audioFileName = req.file.originalname;

    console.log(`[Whisper] Transcribing audio: ${audioFileName}, Language: ${language}`);

    try {
      // Read the file
      const audioBuffer = fs.readFileSync(audioPath);

      // Create a file-like object for OpenAI
      const audioFile = new File([audioBuffer], req.file.originalname, {
        type: req.file.mimetype
      });

      // Call Whisper API
      const transcript = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: language,
        response_format: 'json'
      });

      // Clean up temp file
      fs.unlinkSync(audioPath);

      console.log('[Whisper] Transcription successful');

      res.json({
        success: true,
        transcript: transcript.text,
        language,
        fileName: audioFileName,
        duration: transcript.duration || null
      });

    } catch (transcriptionError) {
      console.error('[Whisper Error]:', transcriptionError.message);

      // Clean up temp file
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }

      if (transcriptionError.message.includes('ECONNREFUSED')) {
        return res.status(503).json({
          error: 'OpenAI service unavailable. Please try again later.',
          details: 'Failed to connect to OpenAI API'
        });
      }

      if (transcriptionError.message.includes('invalid_request_error')) {
        return res.status(400).json({
          error: 'Invalid audio file or unsupported format',
          details: 'Please use MP3, WAV, M4A, FLAC, or OGG'
        });
      }

      if (transcriptionError.message.includes('rate_limit')) {
        return res.status(429).json({
          error: 'Rate limit exceeded. Please try again later.',
          details: 'Too many requests to OpenAI'
        });
      }

      return res.status(500).json({
        error: 'Failed to transcribe audio',
        details: transcriptionError.message || 'Unknown error'
      });
    }

  } catch (error) {
    console.error('[Whisper Controller Error]:', error);
    next(error);
  }
};

export default { transcribeAudio };
