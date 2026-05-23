import React, { useState } from 'react';
import { Menu, X, Youtube } from 'lucide-react';
import HomePage from './pages/HomePage';
import TranscriptGeneratorPage from './pages/TranscriptGeneratorPage';
import FeaturesPage from './pages/FeaturesPage';
import { ResultPage } from './pages/ResultPage';
import Logo from './components/Logo';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);

  const handleResultReady = (data) => {
    setTranscriptData(data);
    navigate('result');
  };

  const navigate = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-slate-900 border-b border-slate-800 shadow-xl sticky top-0 z-[100] backdrop-blur-md bg-opacity-80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <div 
            onClick={() => navigate('home')}
            className="flex items-center gap-2 cursor-pointer group select-none"
          >
            <div className="flex flex-col -space-y-1">
              <span className="text-xl font-black tracking-tighter uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                YT
              </span>
              <span className="text-[10px] font-black text-slate-400 tracking-[0.25em] uppercase leading-none group-hover:text-blue-400 transition-colors">
                Transcript
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-10">
            {['home', 'generator', 'features'].map((page) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                className={`text-sm font-black uppercase tracking-widest transition-all hover:text-blue-400 relative py-1 ${
                  currentPage === page ? 'text-blue-400' : 'text-slate-400'
                }`}
              >
                {page}
                {currentPage === page && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-full animate-fadeIn" />
                )}
              </button>
            ))}
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
             <button 
               onClick={() => navigate('generator')}
               className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black py-2.5 px-6 rounded-full transition shadow-lg shadow-blue-500/20 border border-blue-400/30 uppercase tracking-widest"
             >
               GET PRO
             </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white transition"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Expansion */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 animate-slideDown">
            {['home', 'generator', 'features'].map((page) => (
              <button
                key={page}
                onClick={() => navigate(page)}
                className="block w-full text-left px-8 py-5 text-sm font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 border-b border-slate-800/50 transition-colors"
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {currentPage === 'home' && <HomePage onNavigate={navigate} onResultReady={handleResultReady} />}
        {currentPage === 'generator' && <TranscriptGeneratorPage onResultReady={handleResultReady} />}
        {currentPage === 'features' && <FeaturesPage />}
        {currentPage === 'result' && <ResultPage resultData={transcriptData} onNavigate={navigate} onResultReady={handleResultReady} />}
      </main>

      {/* Modern Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <div 
                onClick={() => navigate('home')}
                className="flex items-center gap-2 mb-6 cursor-pointer group"
              >
                <div className="flex flex-col -space-y-1">
                  <span className="text-lg font-black tracking-tighter uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                    YT
                  </span>
                  <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase leading-none">
                    Transcript
                  </span>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mb-6">
                The world's leading tool for YouTube transcription and video analysis. Empowering creators, students, and businesses with AI insights.
              </p>
              <div className="flex gap-4">
                 {/* Social Placeholders */}
                 <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-400 transition cursor-pointer">
                   <span className="font-bold text-xs">TW</span>
                 </div>
                 <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-blue-400 transition cursor-pointer">
                   <span className="font-bold text-xs">IG</span>
                 </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {['home', 'generator', 'features'].map(page => (
                  <li key={page}>
                    <button onClick={() => navigate(page)} className="text-slate-500 hover:text-blue-400 transition text-sm font-bold uppercase tracking-wider capitalize">{page}</button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Legal</h4>
              <ul className="space-y-4 text-slate-500 text-sm font-bold uppercase tracking-wider">
                <li><a href="#" className="hover:text-blue-400 transition">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400 transition">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-900 pt-10 text-center">
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.25em]">
              &copy; 2024 YT TRANSCRIPT GLOBAL. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
