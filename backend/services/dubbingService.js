import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript/dist/youtube-transcript.esm.js';
import { translateText } from './translateService.js';
import { generateSpeech } from './ttsService.js';
import { mergeAudioChunks } from './audioService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom fetch to bypass YouTube consent walls and bot detection
const bypassFetch = (url, options = {}) => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  ];
  options.headers = {
    ...options.headers,
    'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
    'Accept-Language': 'en-US,en;q=0.9',
    'Cookie': 'CONSENT=YES+cb.20230214-14-p0.en+FX+373'
  };
  return fetch(url, options);
};

export const processDubbing = async (videoId, targetLanguage, ioSocketId, io) => {
    const notify = (status, progress) => {
        if (io && ioSocketId) io.to(ioSocketId).emit('dubbing_progress', { status, progress });
        console.log(`[Dubbing] ${status} (${progress}%)`);
    };

    try {
        notify('Extracting transcript...', 10);
        let transcript = await YoutubeTranscript.fetchTranscript(videoId, { fetch: bypassFetch });
        
        // Prevent massive queues. Restrict to first 2 minutes (120 seconds) for FREE model speed safety
        let limitIndex = transcript.findIndex(t => t.start > 120);
        if (limitIndex !== -1) {
            transcript = transcript.slice(0, limitIndex + 1); // +1 to include the last one crossing 120s
        }

        notify(`Translating ${transcript.length} chunks...`, 20);
        const translatedChunks = [];
        
        // Batch promises to avoid limits, but we do it sequentially to prevent spamming translate API
        for (let i = 0; i < transcript.length; i++) {
            const chunk = transcript[i];
            const translatedText = await translateText(chunk.text, targetLanguage);
            translatedChunks.push({ ...chunk, text: translatedText });
            if (i % 5 === 0) notify(`Translating ${i}/${transcript.length}...`, 20 + Math.floor((i / transcript.length) * 20));
        }

        notify('Generating localized speeches...', 45);
        
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

        const audioChunks = [];
        for (let i = 0; i < translatedChunks.length; i++) {
            const chunk = translatedChunks[i];
            const audioPath = path.join(uploadsDir, `${videoId}_chunk_${i}.mp3`);
            
            // Generate Speech
            await generateSpeech(chunk.text, audioPath, targetLanguage);
            
            audioChunks.push({
                ...chunk,
                audioPath
            });
            if (i % 5 === 0) notify(`Voicing ${i}/${translatedChunks.length}...`, 40 + Math.floor((i / translatedChunks.length) * 40));
        }

        notify('Merging synchronized audio tracks...', 85);
        const finalFilename = `dub_${videoId}_${targetLanguage}_${Date.now()}.mp3`;
        const outputUrl = await mergeAudioChunks(audioChunks, finalFilename);

        // Cleanup temp chunk generated MP3s
        audioChunks.forEach(c => {
            try { fs.unlinkSync(c.audioPath); } catch (e) {}
        });

        notify('Dubbing complete!', 100);
        return outputUrl;

    } catch (err) {
        console.error('[Dubbing Master] Error:', err);
        throw err;
    }
};
