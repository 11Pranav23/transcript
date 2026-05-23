import React, { useState, useEffect } from 'react';
import { Copy, Clock, Volume2, VolumeX, Search, Languages, Star, Zap, FileText, Lightbulb, Layers, HelpCircle, X, ChevronLeft, ChevronRight, ArrowRight, AlertCircle, ChevronLeft as ChevronL, ChevronRight as ChevronR } from 'lucide-react';
import { transcriptAPI } from '../api/api';

export const ResultPage = ({ resultData, onNavigate, onResultReady }) => {
  const [showTimestamps, setShowTimestamps] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(resultData.language || 'en');
  const [newUrl, setNewUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!resultData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950">
        <p className="text-slate-500 mb-4 font-semibold">No video content found.</p>
        <button onClick={() => onNavigate('home')} className="bg-blue-600 text-white px-6 py-2 rounded-xl transition hover:bg-blue-700 shadow-lg">Return Home</button>
      </div>
    );
  }

  const { transcript, metadata, youtubeUrl } = resultData;

  const extractVideoId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = extractVideoId(youtubeUrl);

  const handleCopy = () => {
    const textToCopy = Array.isArray(transcript) 
      ? transcript.map(t => showTimestamps ? `[${formatTime(t.start)}] ${t.text}` : t.text).join('\n')
      : transcript;
    navigator.clipboard.writeText(textToCopy);
    setShowCopyModal(true);
  };

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = Array.isArray(transcript) 
      ? transcript.map(i => i.text).join(' ') 
      : transcript;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = selectedLanguage;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleGenerateNew = async (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsGenerating(true);
    setGenError('');

    try {
      const response = await transcriptAPI.fetchTranscript(newUrl, selectedLanguage);
      
      let fetchedMetadata = null;
      const vId = extractVideoId(newUrl);
      if (vId) {
        try {
          const metadataResponse = await transcriptAPI.getVideoMetadata(vId);
          fetchedMetadata = metadataResponse.data.metadata;
        } catch (err) {
          console.log('Metadata fetch failed');
        }
      }

      if (response.data && response.data.transcript) {
        if (onResultReady) {
          onResultReady({
            transcript: response.data.transcript,
            metadata: fetchedMetadata,
            youtubeUrl: newUrl,
            language: selectedLanguage
          });
          setNewUrl('');
        }
      }
    } catch (err) {
      setGenError(err.response?.data?.error || 'Failed to generate transcript.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative py-10 px-4">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 mb-4 leading-tight">
             {metadata?.title || 'Video Breakdown'}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-blue-400 font-bold">
                 {metadata?.channel?.charAt(0) || 'Y'}
              </span>
              <span>By <strong className="text-white">{metadata?.channel || 'Unknown Channel'}</strong></span>
            </div>
            <span className="hidden sm:inline w-1 h-1 bg-slate-700 rounded-full"></span>
            <button 
              onClick={() => window.open(youtubeUrl, '_blank')}
              className="px-4 py-1.5 bg-slate-900 border border-slate-700 rounded-full hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
            >
               <Zap size={14} className="text-red-500 fill-red-500" /> Watch on YouTube
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Left Column: Transcript Viewer */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-blue-400" />
                    <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Transcript</h2>
                  </div>
                  <button 
                    onClick={handleSpeak}
                    className={`p-3 rounded-xl transition-all ${isSpeaking ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                  >
                    {isSpeaking ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
               </div>

               <div className="p-6">
                  {videoId && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-2xl ring-1 ring-slate-800 group">
                      <iframe 
                        src={`https://www.youtube.com/embed/${videoId}`} 
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <button 
                      onClick={handleCopy}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition shadow-xl shadow-blue-500/10 group"
                    >
                      <Copy size={20} className="group-active:scale-90 transition-transform" /> Copy All
                    </button>
                    <button 
                      onClick={() => setShowTimestamps(!showTimestamps)}
                      className={`font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition border-2 ${showTimestamps ? 'bg-white text-slate-950 border-white' : 'bg-slate-900 text-white border-slate-800 hover:border-slate-700'}`}
                    >
                      <Clock size={20} /> {showTimestamps ? 'Timestamps: ON' : 'Timestamps: OFF'}
                    </button>
                  </div>

                  <div className="bg-slate-950/80 rounded-2xl p-6 border border-slate-800/50 max-h-[600px] overflow-y-auto custom-scrollbar shadow-inner leading-relaxed text-slate-300">
                    {Array.isArray(transcript) ? (
                      <p className="leading-relaxed group">
                        {transcript.map((item, idx) => (
                          <span key={idx} className="hover:text-blue-200 transition-colors cursor-default">
                            {showTimestamps && (
                              <span className="text-blue-500/50 font-mono text-[10px] mr-1.5 align-middle select-none">
                                [{formatTime(item.start)}]
                              </span>
                            )}
                            {item.text}{' '}
                          </span>
                        ))}
                      </p>
                    ) : (
                      <p className="leading-relaxed whitespace-pre-wrap">{transcript}</p>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: New Generation Tool */}
          <div className="space-y-8">
            <div className="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]"></div>
              
              <form onSubmit={handleGenerateNew} className="relative z-10 space-y-8">
                <div>
                  <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.2em] mb-6">Analyze Another Video</h3>
                  <div className="relative">
                     <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                     <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Paste YouTube Link Here..."
                        className="w-full pl-14 pr-8 py-5 rounded-[1.5rem] bg-slate-950 border-2 border-slate-800 text-white font-medium placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
                     />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-950 rounded-3xl border-2 border-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-blue-400 border border-slate-800">
                        <Languages size={24} />
                      </div>
                      <div>
                        <p className="font-black text-white uppercase text-xs tracking-wider">Output Language</p>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Global Support</p>
                      </div>
                    </div>
                    <select 
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="bg-slate-900 border-2 border-slate-800 rounded-xl px-6 py-3 text-sm font-bold text-white outline-none focus:border-blue-500 transition cursor-pointer min-w-[140px]"
                    >
                      <option value="en">ENGLISH</option>
                      <option value="hi">HINDI</option>
                      <option value="es">SPANISH</option>
                      <option value="fr">FRENCH</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating || !newUrl.trim()}
                    className="w-full h-20 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black rounded-[1.5rem] text-xl transition-all shadow-2xl shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 group"
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-7 w-7 border-[3px] border-white/30 border-t-white" />
                    ) : (
                      <Zap size={24} className="fill-white" />
                    )}
                    {isGenerating ? 'ANALYZING...' : 'GENERATE TRANSCRIPT'}
                  </button>
                </div>
              </form>

              {genError && (
                <div className="mt-8 p-5 bg-red-950/40 rounded-2xl border-2 border-red-900/50 flex items-start gap-4 animate-fadeIn">
                  <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm font-medium leading-relaxed">{genError}</p>
                </div>
              )}
            </div>

            {/* Premium Info Area */}
            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2.5rem] border-2 border-slate-800 relative group overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap size={120} className="text-blue-500" />
                </div>
                <div className="flex gap-6 relative z-10">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                     <Star size={28} />
                   </div>
                   <div className="flex-1">
                      <h4 className="text-white font-black uppercase text-sm tracking-[0.2em] mb-3 italic">Fastest Processing</h4>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-[300px]">
                        Our engine processes over 100 hours of video daily with 99.9% uptime. Experience the industry standard in AI transcription.
                      </p>
                   </div>
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Copied Modal */}
      {showCopyModal && (
        <div 
          onClick={() => setShowCopyModal(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] ring-1 ring-slate-200"
          >
            <div className="bg-[#00A36C] py-8 text-center relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/10">
                <Zap size={140} />
              </div>
              <h3 className="text-white text-4xl font-black uppercase tracking-tighter relative z-10 flex items-center justify-center gap-4">
                <Zap size={32} fill="#FFF" /> Copied!
              </h3>
              <button 
                onClick={() => setShowCopyModal(false)}
                className="absolute right-6 top-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-[110] cursor-pointer hover:scale-105 active:scale-95 group"
              >
                <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="p-12 text-center">
              <div className="inline-block px-4 py-1.5 bg-[#FF6633]/10 text-[#FF6633] text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                Most Popular Hack
              </div>
              <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tight leading-none">YT Transcript PRO</h4>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
                Get smart summaries, chat with videos, and markdown exports directly in your browser.
              </p>

              <div className="bg-slate-50 rounded-[2rem] p-6 border-2 border-slate-100 mb-10 relative group">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden aspect-video flex flex-col items-center justify-center border border-slate-100 p-8">
                   <div className="text-[#FF6633] font-black text-2xl mb-2 tracking-tighter italic">EXPORT EVERYTHING</div>
                   <p className="text-slate-400 text-sm mb-6">Instantly sync your breakdowns to Notion, Docs, or Slack.</p>
                   <div className="flex gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl shadow-inner"></div>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl shadow-md border border-slate-200"></div>
                      <div className="w-12 h-12 bg-slate-100 rounded-xl shadow-inner"></div>
                   </div>
                </div>
                
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-xl opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                  <ChevronL size={24} />
                </button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                  <ChevronR size={24} />
                </button>
              </div>

              <div className="flex justify-center gap-2 mb-12">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                <div className="w-8 h-2.5 rounded-full bg-[#FF6633]"></div>
              </div>

              <button 
                onClick={() => setShowCopyModal(false)}
                className="w-full bg-[#FF6633] hover:bg-[#e65c2e] text-white font-black py-6 px-10 rounded-full flex items-center justify-center gap-4 transition shadow-[0_20px_40px_-10px_rgba(255,102,51,0.3)] text-xl hover:scale-[1.02] active:scale-95 group"
              >
                INSTALL FREE EXTENSION
                <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => setShowCopyModal(false)}
                className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-black uppercase tracking-[0.2em] transition-colors"
              >
                No thanks, maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
