import axios from 'axios';
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';
import { OpenAI } from 'openai';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs';
import path from 'path';

const execPromise = util.promisify(exec);

const validateYouTubeUrl = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// Parse YouTube ISO 8601 duration to readable format (HH:MM:SS)
const parseDuration = (isoDuration) => {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);
  
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Custom fetch to bypass YouTube consent walls and bot detection
const bypassFetch = (url, options = {}) => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0'
  ];
  const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

  options.headers = {
    ...options.headers,
    'User-Agent': randomUA,
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': 'CONSENT=YES+cb.20230214-14-p0.en+FX+373' // Bypasses EU consent wall pseudo-429s
  };
  return fetch(url, options);
};

const WHISPER_MAX_BYTES = 24 * 1024 * 1024; // 24 MB — safely under OpenAI's 25 MB limit

const downloadAndTranscribeFallback = async (videoId, language, io) => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Use %(ext)s so yt-dlp picks the correct extension automatically
  const outputTemplate = path.join(uploadsDir, `yt_audio_${videoId}.%(ext)s`);
  const filePrefix = `yt_audio_${videoId}.`;

  // Cleanup any stale files from previous attempts
  fs.readdirSync(uploadsDir)
    .filter(f => f.startsWith(filePrefix))
    .forEach(f => { try { fs.unlinkSync(path.join(uploadsDir, f)); } catch (e) {} });

  console.log(`[Whisper Fallback] ⚡ Fast-downloading audio for video: ${videoId}`);
  io?.emit('progress', { status: '⚡ Downloading audio for transcription...', progress: 25 });

  // Download WORST quality audio (tiny file), no re-encode = fast!
  // Try running with 'python', then fallback to 'python3', and finally to global 'yt-dlp'
  let successDownload = false;
  let lastError = null;

  const runDownload = async (cmdPrefix) => {
    const cmd = `${cmdPrefix} --format "worstaudio/bestaudio" --no-playlist --no-warnings --max-filesize ${WHISPER_MAX_BYTES} -o "${outputTemplate}" "https://www.youtube.com/watch?v=${videoId}"`;
    await execPromise(cmd, { timeout: 120000 });
  };

  try {
    await runDownload('python -m yt_dlp');
    successDownload = true;
  } catch (err) {
    console.log(`[Whisper Fallback] 'python -m yt_dlp' failed, trying 'python3 -m yt_dlp'...`);
    lastError = err;
    try {
      await runDownload('python3 -m yt_dlp');
      successDownload = true;
    } catch (err3) {
      console.log(`[Whisper Fallback] 'python3 -m yt_dlp' failed, trying global 'yt-dlp'...`);
      lastError = err3;
      try {
        await runDownload('yt-dlp');
        successDownload = true;
      } catch (errGlobal) {
        lastError = errGlobal;
      }
    }
  }

  try {
    if (!successDownload) {
      throw new Error(`Audio download failed: ${lastError ? lastError.message : 'Unknown error'}`);
    }

    // Find the actual downloaded file (extension may vary: .webm, .m4a, .opus, .mp4 ...)
    const downloadedFiles = fs.readdirSync(uploadsDir).filter(f => f.startsWith(filePrefix));
    if (downloadedFiles.length === 0) {
      throw new Error('Audio download failed — output file not found');
    }
    const outputPath = path.join(uploadsDir, downloadedFiles[0]);
    const ext = path.extname(outputPath).slice(1) || 'webm';

    const fileSize = fs.statSync(outputPath).size;
    console.log(`[Whisper Fallback] ✅ Download done. File: ${downloadedFiles[0]}, Size: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);
    io?.emit('progress', { status: '🤖 Transcribing with AI (Whisper)...', progress: 55 });

    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured for Whisper fallback');
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const audioBuffer = fs.readFileSync(outputPath);

    // Pick correct MIME type for the file format
    const mimeType = ext === 'mp4' ? 'audio/mp4'
      : ext === 'mp3' ? 'audio/mpeg'
      : ext === 'm4a' ? 'audio/mp4'
      : 'audio/webm';

    const audioFile = new File([audioBuffer], `audio.${ext}`, { type: mimeType });

    const transcriptResponse = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: language === 'auto' ? undefined : language,
      response_format: 'verbose_json'
    });

    // Clean up file immediately after reading
    try { fs.unlinkSync(outputPath); } catch (e) {}

    if (!transcriptResponse.segments || transcriptResponse.segments.length === 0) {
      // Try to return text as a single segment if no segments
      if (transcriptResponse.text) {
        return {
          transcript: [{ text: transcriptResponse.text, start: 0, duration: 0 }],
          language: transcriptResponse.language || language || 'en',
          source: 'whisper_fallback'
        };
      }
      throw new Error('No transcript segments returned from Whisper');
    }

    // Map segments to the format expected by the frontend
    const transcript = transcriptResponse.segments.map(seg => ({
      text: seg.text.trim(),
      start: seg.start,
      duration: seg.end - seg.start
    }));

    console.log(`[Whisper Fallback] ✅ Transcribed ${transcript.length} segments`);

    return {
      transcript,
      language: transcriptResponse.language || language || 'en',
      source: 'whisper_fallback'
    };

  } catch (err) {
    console.error('[Whisper Fallback Error]:', err.message);
    // Cleanup any leftover files on error
    fs.readdirSync(uploadsDir)
      .filter(f => f.startsWith(filePrefix))
      .forEach(f => { try { fs.unlinkSync(path.join(uploadsDir, f)); } catch (e) {} });
    throw err;
  }
};

export const fetchTranscript = async (req, res, next) => {
  try {
    const url = req.body.url || req.body.videoUrl;
    const language = req.body.language || 'auto';
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = validateYouTubeUrl(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL. Please provide a valid YouTube video link or ID.' });
    }

    console.log(`[Transcript] Fetching transcript for video: ${videoId}, language: ${language}`);

    // Emit progress to client
    req.io?.emit('progress', { status: 'Fetching transcript...', progress: 10 });

    try {
      // Try to fetch with the requested language first
      let transcript = null;
      let usedLanguage = language;
      let isTranslated = false;
      
      try {
        if (language === 'auto') {
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { fetch: bypassFetch });
        } else {
          transcript = await YoutubeTranscript.fetchTranscript(videoId, {
            lang: language,
            fetch: bypassFetch
          });
        }
      } catch (langError) {
        console.log(`[Transcript] Language '${language}' not directly available.`);
        
        // Skip fallback if user asked for auto specifically and it failed
        if (language === 'auto') {
          throw langError;
        }

        console.log(`[Transcript] Falling back to default language for translation...`);
        try {
          transcript = await YoutubeTranscript.fetchTranscript(videoId, { fetch: bypassFetch });
          usedLanguage = 'auto'; // We fetched default
        } catch (autoError) {
          throw langError; // Throw the original error if all attempts fail
        }

        // Now we have the default transcript, let's translate it
        if (transcript && transcript.length > 0) {
          req.io?.emit('progress', { status: 'Translating transcript...', progress: 40 });
          console.log(`[Transcript] Translating transcript to ${language} via OpenAI...`);
          
          if (!process.env.OPENAI_API_KEY) {
            console.warn('[Transcript] No OpenAI key, cannot translate. Returning original.');
          } else {
            const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            
            // Extract all texts
            const texts = transcript.map(t => t.text);
            
            // To prevent token limits, we translate in one huge JSON array command.
            // For production, this should ideally be chunked.
            try {
              const completion = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                  {
                    role: 'system',
                    content: `Translate the following JSON array of strings into the language code '${language}'. Return ONLY a valid JSON array of strings of the exact same length. No markdown, no extra text.`
                  },
                  {
                    role: 'user',
                    content: JSON.stringify(texts)
                  }
                ],
                temperature: 0.3
              });

              try {
                let resultText = completion.choices[0].message.content.trim();
                if (resultText.startsWith('```json')) {
                  resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
                }
                const translatedTexts = JSON.parse(resultText);
                
                if (Array.isArray(translatedTexts) && translatedTexts.length === transcript.length) {
                  transcript = transcript.map((t, i) => ({
                    ...t,
                    text: translatedTexts[i] || t.text
                  }));
                  isTranslated = true;
                  usedLanguage = language;
                  console.log(`[Transcript] Successfully translated to ${language}`);
                } else {
                  console.error('[Transcript] Translation array length mismatch or invalid format.');
                }
              } catch (err) {
                console.error('[Transcript] Failed to parse translation response:', err);
              }
            } catch (openaiErr) {
              console.error('[Transcript] OpenAI translation failed (quota/key issue):', openaiErr.message);
              // Gently fallback to auto/default transcript
              req.io?.emit('progress', { status: 'AI Translation bypassed. Returning original.', progress: 60 });
            }
          }
        }
      }

      if (!transcript || transcript.length === 0) {
        return res.status(404).json({
          error: 'No transcript found for this video',
          videoId,
          details: 'The video may not have transcripts enabled in any language. Try a video with captions enabled.'
        });
      }

      // Normalize transcript items: start (seconds), duration (seconds)
      if (transcript && Array.isArray(transcript)) {
        transcript = transcript.map(item => {
          const start = typeof item.start === 'number' ? item.start : (typeof item.offset === 'number' ? item.offset / 1000 : 0);
          const duration = typeof item.duration === 'number' ? (item.duration > 200 ? item.duration / 1000 : item.duration) : 0;
          return {
            text: (item.text || '').trim(),
            start,
            duration
          };
        });
      }

      req.io?.emit('progress', { status: 'Processing transcript...', progress: 80 });

      const transcriptText = transcript.map(item => item.text).join(' ');
      
      console.log(`[Transcript] Successfully processed ${transcript.length} transcript items for ${videoId}`);
      
      res.json({
        success: true,
        videoId,
        language: usedLanguage,
        isTranslated,
        requestedLanguage: language,
        transcript,
        fullText: transcriptText,
        duration: transcript[transcript.length - 1]?.start || 0,
        itemCount: transcript.length
      });

    } catch (transcriptError) {
      console.error(`[Transcript Error] Failed to fetch for ${videoId}:`, transcriptError.message);
      
      // Try local Flask backend fallback if running in development (useful when Node scraper is blocked)
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.log(`[Transcript Fallback] ⚡ Attempting local Flask scraper fallback for: ${videoId}`);
          req.io?.emit('progress', { status: '⚡ Attempting local scraper fallback...', progress: 15 });
          
          const flaskResponse = await axios.post('http://localhost:5001/api/transcript/youtube', {
            url: url,
            language: language
          }, { timeout: 15000 });
          
          if (flaskResponse.data && flaskResponse.data.success && flaskResponse.data.raw_segments) {
            console.log(`[Transcript Fallback] ✅ Successfully fetched transcript from local Flask backend!`);
            
            const transcriptText = flaskResponse.data.raw_segments.map(item => item.text).join(' ');
            
            return res.json({
              success: true,
              videoId,
              language: flaskResponse.data.language || language,
              isTranslated: false,
              requestedLanguage: language,
              transcript: flaskResponse.data.raw_segments,
              fullText: transcriptText,
              duration: flaskResponse.data.raw_segments[flaskResponse.data.raw_segments.length - 1]?.start || 0,
              itemCount: flaskResponse.data.raw_segments.length,
              source: 'local_flask_fallback'
            });
          }
        } catch (flaskError) {
          console.error(`[Transcript Fallback Error] Local Flask fallback failed:`, flaskError.message);
        }
      }
      
      // Attempt Whisper transcription fallback for ANY transcript failure (disabled, no captions, etc.)
      if (process.env.OPENAI_API_KEY) {
        try {
          console.log(`[Transcript Fallback] ⚡ Attempting fast Whisper fallback for: ${videoId}`);
          req.io?.emit('progress', { status: '⚡ Standard transcript unavailable — trying AI fallback...', progress: 20 });
          const fallbackResult = await downloadAndTranscribeFallback(videoId, language, req.io);
          
          const transcriptText = fallbackResult.transcript.map(item => item.text).join(' ');
          
          return res.json({
            success: true,
            videoId,
            language: fallbackResult.language,
            isTranslated: false,
            requestedLanguage: language,
            transcript: fallbackResult.transcript,
            fullText: transcriptText,
            duration: fallbackResult.transcript[fallbackResult.transcript.length - 1]?.start || 0,
            itemCount: fallbackResult.transcript.length,
            source: 'whisper_fallback'
          });
        } catch (fallbackError) {
          console.error(`[Transcript Fallback Error] Whisper fallback failed:`, fallbackError.message);
          // Surface the fallback error to the user for better debugging
          req.io?.emit('progress', { status: `❌ AI fallback failed: ${fallbackError.message}`, progress: 0 });
        }
      }

      // Provide more detailed error messages based on the error
      const errorMessage = (transcriptError.message || '').toLowerCase();
      
      // Check for different error types
      if (errorMessage.includes('too many requests') || errorMessage.includes('captcha') || errorMessage.includes('429')) {
        return res.status(429).json({
          error: 'YouTube is rate limiting requests. Please try again in a few moments.',
          videoId,
          details: 'Too many transcript requests to YouTube'
        });
      }
      
      if (errorMessage.includes('not found') || errorMessage.includes('404') || errorMessage.includes('does not exist')) {
        return res.status(404).json({
          error: 'Video not found',
          videoId,
          details: 'This video does not exist or has been removed. Please check the video ID or URL.'
        });
      }

      if (errorMessage.includes('no longer available') || errorMessage.includes('no longer')) {
        return res.status(410).json({
          error: 'Video is no longer available',
          videoId,
          details: 'This video has been removed or is no longer accessible.'
        });
      }

      if (errorMessage.includes('private') || errorMessage.includes('restricted')) {
        return res.status(403).json({
          error: 'Video access denied',
          videoId,
          details: 'This video is private or restricted. Only the video owner can view transcripts.'
        });
      }

      if (errorMessage.includes('disabled') || errorMessage.includes('no captions')) {
        return res.status(403).json({
          error: 'Transcripts are disabled for this video',
          videoId,
          details: 'The video creator has disabled transcripts or captions for this video. Try a different video with captions enabled.'
        });
      }

      if (errorMessage.includes('transcript') && errorMessage.includes('not available')) {
        return res.status(404).json({
          error: 'No transcripts available',
          videoId,
          details: `Transcripts are not available in the requested language. Try a different language or video.`
        });
      }

      // Default error - likely no transcripts available
      return res.status(404).json({
        error: 'Unable to fetch transcript for this video',
        videoId,
        details: 'The video may not have transcripts/captions enabled. Make sure to select a video with captions.',
        errorType: transcriptError.name
      });
    }

  } catch (error) {
    console.error('[Transcript Fatal Error]:', error.message);
    next(error);
  }
};

export const getAvailableLanguagesList = async (req, res, next) => {
  try {
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    try {
      // Return a robust list of supported target languages.
      // Since we can fallback to auto-translation, we can support many languages.
      const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ru', name: 'Russian' },
        { code: 'hi', name: 'Hindi' },
        { code: 'ar', name: 'Arabic' }
      ];

      res.json({
        success: true,
        languages,
        videoId
      });

    } catch (error) {
      return res.status(403).json({
        error: 'Unable to fetch language information.'
      });
    }

  } catch (error) {
    next(error);
  }
};

export const getAvailableLanguages = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = validateYouTubeUrl(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
      // NOTE: YoutubeTranscript library has limited language support
      // For full language list, you'd need to use a different library or API
      const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' },
        { code: 'ru', name: 'Russian' }
      ];

      res.json({
        success: true,
        languages,
        videoId
      });

    } catch (error) {
      return res.status(403).json({
        error: 'Unable to fetch language information.'
      });
    }

  } catch (error) {
    next(error);
  }
};

export const getVideoMetadata = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (!youtubeApiKey) {
      return res.status(500).json({ error: 'YouTube API key not configured' });
    }

    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: youtubeApiKey
        }
      });

      if (!response.data.items || response.data.items.length === 0) {
        return res.status(404).json({ error: 'Video not found' });
      }

      const video = response.data.items[0];
      const snippet = video.snippet || {};
      const statistics = video.statistics || {};
      const contentDetails = video.contentDetails || {};

      // Convert ISO 8601 duration to readable format
      const duration = contentDetails.duration ? parseDuration(contentDetails.duration) : 'N/A';

      res.json({
        success: true,
        metadata: {
          title: snippet.title,
          channel: snippet.channelTitle,
          description: snippet.description,
          thumbnail: snippet.thumbnails?.default?.url,
          publishedAt: snippet.publishedAt,
          duration: duration,
          viewCount: statistics.viewCount,
          likeCount: statistics.likeCount,
          commentCount: statistics.commentCount
        }
      });

    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch video metadata' });
    }

  } catch (error) {
    next(error);
  }
};

export const getLanguages = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = validateYouTubeUrl(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    try {
      // Fetch available transcripts for all languages
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      
      // Get available languages
      const languages = await YoutubeTranscript.getTranscript(videoId);
      
      // Predefined language names mapping
      const languageMap = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh-Hans': 'Chinese (Simplified)',
        'zh-Hant': 'Chinese (Traditional)',
        'zh': 'Chinese',
        'hi': 'Hindi',
        'ar': 'Arabic',
        'pl': 'Polish',
        'tr': 'Turkish',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'no': 'Norwegian',
        'da': 'Danish',
        'fi': 'Finnish',
        'th': 'Thai',
        'vi': 'Vietnamese',
        'id': 'Indonesian'
      };

      // Return available languages
      res.json({
        success: true,
        videoId,
        languages: [
          { code: 'en', name: '🇺🇸 English' },
          { code: 'es', name: '🇪🇸 Spanish' },
          { code: 'fr', name: '🇫🇷 French' },
          { code: 'de', name: '🇩🇪 German' },
          { code: 'it', name: '🇮🇹 Italian' },
          { code: 'pt', name: '🇵🇹 Portuguese' },
          { code: 'ru', name: '🇷🇺 Russian' },
          { code: 'ja', name: '🇯🇵 Japanese' },
          { code: 'ko', name: '🇰🇷 Korean' },
          { code: 'zh', name: '🇨🇳 Chinese' },
          { code: 'hi', name: '🇮🇳 Hindi' },
          { code: 'ar', name: '🇸🇦 Arabic' }
        ]
      });

    } catch (error) {
      console.error('[Languages Error]:', error.message);
      return res.status(404).json({
        error: 'Unable to fetch available languages',
        details: 'The video may not have transcripts in any language'
      });
    }

  } catch (error) {
    next(error);
  }
};
