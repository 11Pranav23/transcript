import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bind fluent-ffmpeg to the static binaries downloaded via npm
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export const mergeAudioChunks = async (chunks, outputFilename) => {
  return new Promise(async (resolve, reject) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

    const outputPath = path.join(uploadsDir, outputFilename);
    const silencePath = path.join(uploadsDir, 'silence.mp3');
    
    // Create a 60-second silence file matched to google-tts format (24000Hz Mono) if it doesn't exist
    if (!fs.existsSync(silencePath)) {
      await new Promise((res, rej) => {
        ffmpeg()
          .input('anullsrc=r=24000:cl=mono')
          .inputFormat('lavfi')
          .duration(60)
          .audioBitrate('32k')
          .save(silencePath)
          .on('end', res)
          .on('error', rej);
      });
    }

    // Generate list in the uploads directory
    const listName = `list_${Date.now()}.txt`;
    const listPath = path.join(uploadsDir, listName);
    
    // FFMPEG runs with process.cwd() as D:\cc\backend natively
    // We pass the relative path from the backend root.
    const relativeToNode = `uploads/${listName}`;
    
    let listContent = '';
    let previousEnd = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const gap = chunk.start - previousEnd;
        
        if (gap > 0.1) {
            const silenceDuration = Math.min(gap, 60).toFixed(3);
            listContent += `file 'silence.mp3'\n`;
            listContent += `inpoint 0.000\n`;
            listContent += `outpoint ${silenceDuration}\n`;
        }
        
        listContent += `file '${path.basename(chunk.audioPath)}'\n`;
        previousEnd = chunk.start + chunk.duration;
    }

    fs.writeFileSync(listPath, listContent);

    // Provide the exact path relative to the node.js execution context (which is backend folder)
    ffmpeg()
      .input(relativeToNode)
      .inputOptions(['-f concat', '-safe 0'])
      // Force uniform re-encoding to avoid format mismatches breaking the concat
      .audioFrequency(24000)
      .audioChannels(1)
      .save(outputPath)
      .on('end', () => {
        try { fs.unlinkSync(listPath); } catch(e){}
        resolve(`/uploads/${outputFilename}`);
      })
      .on('error', (err) => {
        console.error('[Audio Service] Merge error:', err);
        reject(err);
      });
  });
};
