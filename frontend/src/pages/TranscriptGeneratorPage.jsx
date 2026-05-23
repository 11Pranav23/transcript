import React, { useState } from 'react';
import { Zap, Copy, AlertCircle } from 'lucide-react';
import { transcriptAPI, aiAPI, exportAPI, dubbingAPI } from '../api/api';
import { PrimaryButton, SecondaryButton, LoadingSpinner, ErrorMessage, SuccessMessage, Card } from '../components/Common';
import { TranscriptViewer, TranscriptExportOptions, TranscriptTabs } from '../components/TranscriptComponents';
import Logo from '../components/Logo';
import { io } from 'socket.io-client';

let socketUrl = process.env.REACT_APP_API_URL || 'https://transcript-9f8a.onrender.com';
if (socketUrl.endsWith('/api')) {
  socketUrl = socketUrl.substring(0, socketUrl.length - 4);
}
const socket = io(socketUrl);

export const TranscriptGeneratorPage = ({ onResultReady }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState(localStorage.getItem('preferredTranscriptLanguage') || 'auto');
  const [transcript, setTranscript] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [availableLanguages, setAvailableLanguages] = useState([
    { code: 'auto', name: 'Auto Detect' },
    { code: 'en', name: 'English' }
  ]);
  const [dubbingLoading, setDubbingLoading] = useState(false);
  const [dubbingProgress, setDubbingProgress] = useState({ status: '', progress: 0 });
  const [dubbedAudioUrl, setDubbedAudioUrl] = useState('');

  React.useEffect(() => {
    socket.on('dubbing_progress', (data) => {
      setDubbingProgress(data);
    });
    return () => {
      socket.off('dubbing_progress');
    };
  }, []);

  const validateYouTubeUrl = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  React.useEffect(() => {
    const videoId = validateYouTubeUrl(youtubeUrl);
    if (videoId) {
      const fetchLangs = async () => {
        try {
          const response = await transcriptAPI.getLanguages(videoId);
          if (response.data && response.data.languages) {
            setAvailableLanguages([{ code: 'auto', name: 'Auto Detect' }, ...response.data.languages]);
          }
        } catch (err) {
          console.error('Could not fetch languages', err);
        }
      };
      fetchLangs();
    } else {
      setAvailableLanguages([
        { code: 'auto', name: 'Auto Detect' },
        { code: 'en', name: 'English' }
      ]);
    }
  }, [youtubeUrl]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem('preferredTranscriptLanguage', newLang);
  };

  const handleGenerateTranscript = async (e) => {
    e.preventDefault();

    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgressMessage('Fetching transcript...');

    try {
      const response = await transcriptAPI.fetchTranscript(youtubeUrl, language);

      let fetchedMetadata = null;
      const videoId = validateYouTubeUrl(youtubeUrl);
      if (videoId) {
        try {
          const metadataResponse = await transcriptAPI.getVideoMetadata(videoId);
          fetchedMetadata = metadataResponse.data.metadata;
        } catch (err) {
          console.log('Metadata fetch failed, continuing anyway');
        }
      }

      if (response.data && response.data.transcript) {
        if (onResultReady) {
          onResultReady({
            transcript: response.data.transcript,
            metadata: fetchedMetadata,
            youtubeUrl,
            language
          });
          return;
        }

        setTranscript(response.data.transcript);
        setMetadata({
          ...fetchedMetadata,
          transcriptLanguage: response.data.language,
          isTranslated: response.data.isTranslated
        });
        setProgressMessage('');
        setSuccess('Subtitles fetched successfully!');
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch transcript. Please check the URL and try again.');
      setProgressMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDubbing = async (e) => {
    e.preventDefault();

    if (!youtubeUrl.trim() || language === 'auto') {
      setError('Please enter a YouTube URL and select a specific target language (Not Auto Detect).');
      return;
    }

    setDubbingLoading(true);
    setError('');
    setSuccess('');
    setDubbedAudioUrl('');
    setDubbingProgress({ status: 'Starting dubbing task...', progress: 5 });

    try {
      const response = await dubbingAPI.generateDub(youtubeUrl, language, socket.id);

      if (response.data && response.data.audioUrl) {
        setDubbedAudioUrl(`http://localhost:5000${response.data.audioUrl}`);
        setSuccess('Dubbed audio generated successfully!');
        setDubbingProgress({ status: '', progress: 0 });
      } else {
        setError('Invalid response from dubbing server.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate dub. Ensure the language is supported.');
      setDubbingProgress({ status: '', progress: 0 });
    } finally {
      setDubbingLoading(false);
    }
  };

  const handleAIAction = async (action, question = null) => {
    if (!transcript) {
      setError('No transcript available');
      return;
    }

    try {
      const transcriptText = Array.isArray(transcript)
        ? transcript.map(item => item.text).join(' ')
        : transcript;

      switch (action) {
        case 'summary':
          const summaryRes = await aiAPI.summarize(transcriptText.substring(0, 4000), language);
          return summaryRes.data.summary;
        case 'keypoints':
          const keypointsRes = await aiAPI.extractKeyPoints(transcriptText.substring(0, 4000), language);
          return keypointsRes.data.keyPoints;
        case 'flashcards':
          const flashcardsRes = await aiAPI.generateFlashcards(transcriptText.substring(0, 4000), language);
          return flashcardsRes.data.flashcards;
        case 'question':
          const answerRes = await aiAPI.answerQuestion(transcriptText.substring(0, 3000), question, language);
          return answerRes.data.answer;
        default:
          return null;
      }
    } catch (err) {
      setError('AI feature not available. Please check your OpenAI API key.');
      throw err;
    }
  };

  const handleExport = async (format) => {
    if (!transcript) {
      setError('No transcript to export');
      return;
    }

    try {
      let response;
      const fileName = metadata?.title || 'transcript';

      switch (format) {
        case 'text':
          response = await exportAPI.downloadText(transcript, fileName);
          break;
        case 'pdf':
          response = await exportAPI.downloadPDF(transcript, fileName, metadata?.title, metadata);
          break;
        case 'docx':
          response = await exportAPI.downloadDocx(transcript, fileName, metadata?.title, metadata);
          break;
        default:
          return;
      }

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName}.${format === 'docx' ? 'docx' : format}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Exported as ${format.toUpperCase()}`);
    } catch (err) {
      setError('Failed to export transcript');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl animate-pulse"></div>
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 mb-4">
            <span className="flex items-center gap-4">
              <Logo className="w-16 h-16 md:w-20 md:h-20" />
              YouTube Subtitle Generator
            </span>
          </h1>
          <p className="text-lg text-slate-300 font-medium">Extract, analyze, and export YouTube subtitles with AI-powered summaries</p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <form onSubmit={handleGenerateTranscript} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                YouTube URL
              </label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-5 py-4 rounded-xl text-base font-medium border-2 border-slate-600 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <p className="text-xs text-slate-400 mt-2">
                Paste any YouTube video link - we'll extract the subtitles automatically
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-3">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Language
                </label>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full px-5 py-4 rounded-xl text-base font-medium border-2 border-slate-600 bg-slate-900/50 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <LoadingSpinner /> : null}
              {loading ? '⏳ Processing...' : 'Generate Transcript'}
            </button>

            <button
              onClick={handleGenerateDubbing}
              disabled={dubbingLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
              type="button"
            >
              {dubbingLoading ? <LoadingSpinner /> : <span className="text-xl">🎧</span>}
              {dubbingLoading ? '⏳ Dubbing Audio...' : 'Generate Audio Dub (BETA)'}
            </button>
          </form>
        </Card>

        {dubbingProgress.status && (
          <div className="mb-8 p-6 bg-slate-900 border-2 border-emerald-500/30 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: `${dubbingProgress.progress}%` }}></div>
            <div className="flex items-center gap-3 text-emerald-400 font-semibold text-lg relative z-10">
              <LoadingSpinner />
              <span>{dubbingProgress.status}</span>
              <span className="ml-auto">{dubbingProgress.progress}%</span>
            </div>
          </div>
        )}

        {dubbedAudioUrl && (
          <div className="mb-8 p-6 bg-slate-800 rounded-xl border border-slate-700 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <span className="text-emerald-500">🎧</span> Your Dubbed Audio Track
            </h3>
            <audio controls src={dubbedAudioUrl} className="w-full h-12 rounded-lg"></audio>
            <a
              href={dubbedAudioUrl}
              download
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition"
            >
              ⬇️ Download MP3
            </a>
          </div>
        )}

        {/* Messages */}
        {error && <ErrorMessage message={error} />}
        {success && <SuccessMessage message={success} />}
        {progressMessage && (
          <div className="mb-4 p-4 bg-slate-800 text-blue-400 rounded-lg flex items-center gap-2 font-semibold">
            <LoadingSpinner />
            <span>{progressMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranscriptGeneratorPage;
