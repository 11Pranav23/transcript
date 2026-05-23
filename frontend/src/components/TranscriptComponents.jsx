import React, { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Common';

export const TranscriptViewer = ({ transcript, loading, metadata }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIndex, setExpandedIndex] = useState(null);

  const filteredTranscript = Array.isArray(transcript)
    ? transcript.filter(item =>
        item.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const formatTime = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (!transcript || (Array.isArray(transcript) && transcript.length === 0)) {
    return <div className="text-center text-slate-400 py-8">No subtitles available</div>;
  }

  return (
    <div className="space-y-4">
      {metadata && metadata.transcriptLanguage && (
        <div className={`p-3 rounded-lg flex items-center justify-between text-sm font-semibold ${metadata.isTranslated ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30' : 'bg-blue-900/50 text-blue-300 border border-blue-500/30'}`}>
          <span>Language: {metadata.transcriptLanguage.toUpperCase()} {metadata.isTranslated ? '(AI Translated)' : '(Original)'}</span>
          {metadata.isTranslated && <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">AI Translated</span>}
        </div>
      )}
      <div className="relative">
        <input
          type="text"
          placeholder="Search in subtitles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-slate-600 bg-slate-900/50 text-white placeholder-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {filteredTranscript.map((item, index) => (
          <div 
            key={index}
            className="p-3 bg-slate-900 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-mono text-sm text-blue-400 font-bold">
                  {formatTime(item.start)}
                </div>
                <p className="text-slate-300 text-sm mt-1">
                  {item.text}
                </p>
              </div>
              <Copy 
                size={16} 
                className="text-slate-500 hover:text-blue-400 ml-2 flex-shrink-0"
                onClick={() => navigator.clipboard.writeText(item.text)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TranscriptExportOptions = ({ transcript, metadata, onExport }) => {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      await onExport(format);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <SecondaryButton
        onClick={() => handleExport('text')}
        disabled={exporting === 'text'}
        className="flex items-center justify-center gap-2"
      >
        <Download size={18} />
        {exporting === 'text' ? 'Exporting...' : 'Export as TXT'}
      </SecondaryButton>
      
      <SecondaryButton
        onClick={() => handleExport('pdf')}
        disabled={exporting === 'pdf'}
        className="flex items-center justify-center gap-2"
      >
        <Download size={18} />
        {exporting === 'pdf' ? 'Exporting...' : 'Export as PDF'}
      </SecondaryButton>
      
      <SecondaryButton
        onClick={() => handleExport('docx')}
        disabled={exporting === 'docx'}
        className="flex items-center justify-center gap-2"
      >
        <Download size={18} />
        {exporting === 'docx' ? 'Exporting...' : 'Export as DOCX'}
      </SecondaryButton>
    </div>
  );
};

export const TranscriptTabs = ({ transcript, metadata, loading, onAIAction }) => {
  const [activeTab, setActiveTab] = useState('subtitles');
  const [aiResults, setAIResults] = useState({});
  const [aiLoading, setAiLoading] = useState(null);

  const tabs = ['subtitles', 'summary', 'keypoints', 'flashcards', 'chat'];

  const handleAIAction = async (action) => {
    setAiLoading(action);
    try {
      const result = await onAIAction(action);
      setAIResults(prev => ({ ...prev, [action]: result }));
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize transition ${
              activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-slate-800 rounded-lg p-4 text-slate-300">
        {activeTab === 'subtitles' && <TranscriptViewer transcript={transcript} loading={loading} metadata={metadata} />}
        
        {activeTab === 'summary' && (
          <div>
            {!aiResults.summary ? (
              <PrimaryButton onClick={() => handleAIAction('summary')} disabled={aiLoading === 'summary'}>
                {aiLoading === 'summary' ? 'Generating...' : 'Generate Summary'}
              </PrimaryButton>
            ) : (
              <div className="bg-slate-900 border border-slate-700 p-4 rounded-lg">
                <p>{aiResults.summary}</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'keypoints' && (
          <div>
            {!aiResults.keypoints ? (
              <PrimaryButton onClick={() => handleAIAction('keypoints')} disabled={aiLoading === 'keypoints'}>
                {aiLoading === 'keypoints' ? 'Extracting...' : 'Extract Key Points'}
              </PrimaryButton>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {aiResults.keypoints.map((point, idx) => (
                  <li key={idx} className="text-slate-300">{point}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {activeTab === 'flashcards' && (
          <div>
            {!aiResults.flashcards ? (
              <PrimaryButton onClick={() => handleAIAction('flashcards')} disabled={aiLoading === 'flashcards'}>
                {aiLoading === 'flashcards' ? 'Generating...' : 'Generate Flashcards'}
              </PrimaryButton>
            ) : (
              <div className="space-y-3">
                {aiResults.flashcards.map((card, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-primary to-secondary text-white p-4 rounded-lg">
                    <p className="font-bold mb-2">Q: {card.question}</p>
                    <p className="text-sm opacity-90">A: {card.answer}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="text-slate-500 text-center py-8">
            Chat feature coming soon...
          </div>
        )}
      </div>
    </div>
  );
};
