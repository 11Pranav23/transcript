import * as googleTTS from 'google-tts-api';
import fs from 'fs';
import axios from 'axios';

export const generateSpeech = async (text, filepath, lang = 'en') => {
  try {
    // google-tts-api has a 200 character limit per request. 
    // Most YouTube caption chunks are under this, but we truncate just in case to prevent errors
    const safeText = text.substring(0, 199);
    
    const url = googleTTS.getAudioUrl(safeText, {
      lang: lang,
      slow: false,
      host: 'https://translate.google.com',
    });
    
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });
    
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(filepath);
      response.data.pipe(writer);
      writer.on('finish', () => resolve(filepath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error("[TTS Service] Error generating speech:", error.message);
    throw error;
  }
};
