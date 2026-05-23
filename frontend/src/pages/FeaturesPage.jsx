import React from 'react';
import { Check } from 'lucide-react';

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-16 px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Features</h1>
        <p className="text-center text-slate-300 mb-12">Everything you need to extract and analyze YouTube subtitles</p>

        <div className="space-y-8">
          {[
            {
              title: 'Subtitle Extraction',
              description: 'Automatically extract subtitles from any YouTube video with perfect accuracy and timestamps.',
              features: ['Full subtitle with timestamps', 'Auto-detect language', 'Support for all video types', 'Real-time processing']
            },
            {
              title: 'AI-Powered Analysis',
              description: 'Use advanced AI to summarize, analyze, and learn from video content.',
              features: ['Auto-generated summaries', 'Key points extraction', 'Flashcard generation', 'Q&A functionality']
            },
            {
              title: 'Export & Share',
              description: 'Download subtitles in multiple formats for editing, sharing, or archives.',
              features: ['TXT format', 'PDF with formatting', 'DOCX for editing', 'Copy to clipboard']
            },
            {
              title: 'Multi-Language',
              description: 'Work with videos in any language with automatic translation and multilingual support.',
              features: ['10+ languages supported', 'Auto-translation', 'Language detection', 'Custom language selection']
            },
            {
              title: 'Fast & Reliable',
              description: 'Lightning-fast processing with 99.9% uptime and reliable extraction.',
              features: ['Sub-second response time', 'High availability', 'Error handling', 'Automatic retries']
            },
            {
              title: 'Easy Integration',
              description: 'Simple paste-and-go workflow - no downloads or complex setup needed.',
              features: ['Web-based tool', 'No installation', 'No signup required', 'Instant processing']
            }
          ].map((section, idx) => (
            <div key={idx} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-2">{section.title}</h2>
              <p className="text-slate-300 mb-6">{section.description}</p>
              <ul className="grid md:grid-cols-2 gap-3">
                {section.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-2">
                    <Check size={20} className="text-green-500 flex-shrink-0" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
