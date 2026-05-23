import axios from 'axios';

let envApiUrl = process.env.REACT_APP_API_URL || 'https://transcript-9f8a.onrender.com';

// Automatically target local backend when testing on localhost
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
  envApiUrl = 'http://localhost:5000';
}

if (envApiUrl && !envApiUrl.endsWith('/api')) {
  envApiUrl = envApiUrl.replace(/\/$/, '') + '/api';
}
const API_BASE_URL = envApiUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 120 seconds (2 minutes) to allow time for Whisper fallback transcription
});

export const transcriptAPI = {
  fetchTranscript: (videoUrl, language = 'auto') =>
    apiClient.post('/transcript/fetch', { videoUrl, language }),

  getLanguages: (videoId) =>
    apiClient.get(`/transcript/languages/${videoId}`),

  getVideoMetadata: (videoId) =>
    apiClient.get(`/transcript/metadata/${videoId}`),
};

export const aiAPI = {
  summarize: (transcript, language = 'en', summaryType = 'brief') =>
    apiClient.post('/ai/summarize', { transcript, language, summaryType }),

  extractKeyPoints: (transcript, language = 'en') =>
    apiClient.post('/ai/keypoints', { transcript, language }),

  generateFlashcards: (transcript, language = 'en', count = 5) =>
    apiClient.post('/ai/flashcards', { transcript, language, count }),

  answerQuestion: (transcript, question, language = 'en') =>
    apiClient.post('/ai/question', { transcript, question, language }),
};

export const exportAPI = {
  downloadText: (transcript, fileName = 'transcript') =>
    apiClient.post('/export/text', { transcript, fileName }, { responseType: 'blob' }),

  downloadPDF: (transcript, fileName = 'transcript', title = 'Video Transcript', metadata = {}) =>
    apiClient.post('/export/pdf', { transcript, fileName, title, metadata }, { responseType: 'blob' }),

  downloadDocx: (transcript, fileName = 'transcript', title = 'Video Transcript', metadata = {}) =>
    apiClient.post('/export/docx', { transcript, fileName, title, metadata }, { responseType: 'blob' }),
};

export const dubbingAPI = {
  generateDub: (videoUrl, targetLanguage, socketId) =>
    apiClient.post('/dubbing/generate', { videoUrl, targetLanguage, socketId }),
};

export default apiClient;
