import React, { useState } from 'react';
import { Bell, Pause, Play } from 'lucide-react';
import { Language } from '../types';
import { breakingNewsList } from '../data/news';
import { translations } from '../data/translations';

interface TickerBarProps {
  language: Language;
}

export const TickerBar: React.FC<TickerBarProps> = ({ language }) => {
  const t = translations[language];
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 border-b border-rose-900/30 text-white overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center">
        
        {/* Ticker Label Badge */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-red-700 px-4 py-2 font-bold text-xs uppercase tracking-wider shrink-0 shadow-md">
          <Bell className="w-4 h-4 animate-bounce" />
          <span>{t.breakingNews}</span>
        </div>

        {/* Marquee Container */}
        <div className="flex-1 overflow-hidden relative py-2 px-3">
          <div 
            className={`flex items-center whitespace-nowrap gap-12 text-xs sm:text-sm font-medium ${
              isPlaying ? 'animate-marquee' : ''
            }`}
            style={{ animationDuration: '35s' }}
          >
            {breakingNewsList.map((item) => (
              <div key={item.id} className="inline-flex items-center gap-3 shrink-0 hover:text-rose-300 transition cursor-pointer">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-slate-400 font-mono text-xs">[{item.source}]</span>
                <span>
                  {language === 'ps' ? item.titlePs : language === 'dr' ? item.titleDr : item.titleEn}
                </span>
                <span className="text-[11px] text-slate-500 font-sans">({item.time})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ticker Play / Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-3 py-2 text-slate-400 hover:text-white transition shrink-0 border-r border-slate-800"
          title={isPlaying ? 'Pause Ticker' : 'Play Ticker'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
