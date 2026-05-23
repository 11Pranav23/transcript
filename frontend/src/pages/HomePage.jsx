import React, { useState } from 'react';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../components/Common';
import { transcriptAPI, aiAPI } from '../api/api';

export const HomePage = ({ onNavigate, onResultReady }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [transcript, setTranscript] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [progressMessage, setProgressMessage] = useState('');
  const [showLanguages, setShowLanguages] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedAiAction, setSelectedAiAction] = useState('summarize');

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

  const handleFetchLanguages = async () => {
    if (!youtubeUrl) {
      setError('Please enter a YouTube URL first');
      return;
    }
    try {
      const response = await transcriptAPI.getLanguages(youtubeUrl);
      if (response.data?.languages) {
        setAvailableLanguages(response.data.languages);
        setShowLanguages(!showLanguages);
      }
    } catch (err) {
      setError('Could not fetch available languages');
    }
  };

  const handleGenerateTranscript = async (e) => {
    e.preventDefault();
    
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = validateYouTubeUrl(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL. Please enter a valid YouTube video link, Short, or video ID.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setProgressMessage('Fetching transcript...');

    try {
      const response = await transcriptAPI.fetchTranscript(youtubeUrl, language);
      
      if (response.data && response.data.transcript) {
        setSuccess('✅ Subtitles fetched successfully!');
        
        let fetchedMetadata = null;
        try {
          const metadataResponse = await transcriptAPI.getVideoMetadata(videoId);
          fetchedMetadata = metadataResponse.data.metadata;
        } catch (err) {
          console.log('Metadata fetch failed, continuing anyway');
        }

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
        setProgressMessage('');
        setShowLanguages(false);
      } else {
        setError('Invalid response from server. Please try again.');
      }
    } catch (err) {
      let errorMessage = 'Failed to fetch subtitles. Please check the URL and try again.';
      
      if (err.response?.status === 404) {
        errorMessage = '❌ Video not found or subtitles are not available.';
      } else if (err.response?.status === 429) {
        errorMessage = '⚠️ YouTube is rate limiting. Please wait and try again.';
      } else if (err.response?.status === 403) {
        errorMessage = '❌ ' + (err.response?.data?.error || 'Subtitles are disabled for this video.');
      } else if (!err.response) {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          errorMessage = '❌ Cannot connect to server. Make sure the backend is running on port 5000.';
        } else {
          errorMessage = '❌ Cannot connect to server. The backend server (Render) might be sleeping or waking up. Please wait 15 seconds and try again.';
        }
      }
      
      setError(errorMessage);
      setProgressMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleAIAction = async (action) => {
    if (!transcript) {
      setError('No transcript available');
      return;
    }

    setAiLoading(true);
    setAiResponse('');
    setSelectedAiAction(action);

    try {
      const transcriptText = Array.isArray(transcript) 
        ? transcript.map(item => item.text).join(' ') 
        : transcript;

      let response;
      if (action === 'summarize') {
        response = await aiAPI.summarize(transcriptText, language);
      } else if (action === 'keypoints') {
        response = await aiAPI.extractKeyPoints(transcriptText, language);
      } else if (action === 'flashcards') {
        response = await aiAPI.generateFlashcards(transcriptText, language, 10);
      } else if (action === 'question') {
        response = await aiAPI.answerQuestion(transcriptText, 'What is this about?', language);
      }

      if (response.data?.response) {
        setAiResponse(response.data.response);
      }
    } catch (err) {
      setError('AI processing failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-32 md:py-48">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full opacity-5 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-purple-500 rounded-full opacity-5 blur-3xl"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 mb-6 leading-tight">
            YouTube to Transcript Free
          </h1>

          <p className="text-lg md:text-xl text-slate-300 font-medium mb-8 leading-relaxed max-w-2xl">
            Transform YouTube videos, Shorts, and audio files into accurate subtitles in 100+ languages with AI-powered analysis.
          </p>

          <div className="flex flex-wrap gap-6 mb-12 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Lightning Fast Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>100+ Languages</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>AI-Powered Analysis</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleGenerateTranscript} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 md:p-10 shadow-2xl mb-8">
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-3">YouTube URL or Video ID</label>
              <input
                type="text"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Paste your YouTube URL..."
                className="w-full px-5 py-4 rounded-xl text-base font-medium border-2 border-slate-600 bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition shadow-lg disabled:opacity-50"
            >
              {loading ? '⏳ Processing...' : 'Generate Transcript'}
            </button>
          </form>
        </div>
      </section>

      {/* Messages */}
      {error && <div className="max-w-4xl mx-auto px-4 mt-6"><ErrorMessage message={error} /></div>}
      {success && <div className="max-w-4xl mx-auto px-4 mt-6"><SuccessMessage message={success} /></div>}
      {progressMessage && (
        <div className="max-w-4xl mx-auto px-4 mt-6 p-4 bg-slate-800 text-blue-400 rounded-lg flex items-center gap-2 font-semibold">
          <LoadingSpinner />
          <span>{progressMessage}</span>
        </div>
      )}

      {/* Features */}
      <section className="py-16 bg-slate-900 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Choose YT Transcript?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant Summaries</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Transform hours of video into concise, actionable summaries in seconds using advanced AI.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">125+ Languages</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Break language barriers with support for over 125 languages and accurate translations.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Smart Key Points</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Automatically extract the most important takeaways and key insights from any video content.</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 hover:border-green-500/50 transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🆓</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Always Free</h3>
              <p className="text-slate-400 text-sm leading-relaxed">No subscriptions, no hidden fees, and no daily limits. Professional tools for everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-slate-950 text-white px-4 py-12 text-center border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-lg transition"
        >
          ⬆️ Back to Converter
        </button>
      </section>
    </div>
  );
};

export default HomePage;
